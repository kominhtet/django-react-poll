from rest_framework import viewsets
from .models import (
    PollCategory, PollLevel, PointExchangeType, 
    ChangePoints, Poll, Point, PollOption, MainPoll, Vote, Profile
)
from .serializers import (
    PollCategorySerializer, PollLevelSerializer,  
    PointExchangeTypeSerializer, ChangePointsSerializer, PollSerializer, 
    PointSerializer, PollOptionSerializer, MainPollSerializer, ProfileSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import VoteResultsSerializer
from rest_framework.views import APIView
from rest_framework import status
from rest_framework import filters
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, RegisterSerializer, VoteSerializer
from rest_framework import generics
from api.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Sum
import logging
from django.shortcuts import render, redirect
from django.db.models import Count

logger = logging.getLogger(__name__)

def index(request):
    profiles = Profile.objects.all()
    polls = Poll.objects.select_related('poll_category').prefetch_related('polloption_set__point').all()    
    # Count the number of Polls and PollOptions
    main_poll_count = Poll.objects.count()
    sub_poll_count = PollOption.objects.count()
    category_poll_count = PollCategory.objects.count()
    profile_count = Profile.objects.count()
    polls = Poll.objects.all()
    polls_with_votes = Poll.objects.annotate(total_votes=Count('polloption__votes'))
    
    # Get the count of polls per category
    poll_counts_per_category = Poll.objects.values('poll_category__name').annotate(count=Count('id'))

    # Annotate PollOptions with the number of votes
    poll_options_with_votes = PollOption.objects.annotate(vote_count=Count('votes'))
    context = {
        'profiles': profiles,
        'polls': polls,
        'main_poll_count': main_poll_count,
        'sub_poll_count': sub_poll_count,
        'category_poll_count': category_poll_count,
        'profile_count': profile_count,
        'polls_with_votes': polls_with_votes,
        'poll_counts_per_category': poll_counts_per_category,
        'poll_options_with_votes': poll_options_with_votes
    }
    return render(request, 'home/index.html', context)

def poll_list(request):
    # Get all polls
    polls = Poll.objects.all()
    polls_with_votes = Poll.objects.annotate(total_votes=Count('polloption__votes'))
    
    # Get the count of polls per category
    poll_counts_per_category = Poll.objects.values('poll_category__name').annotate(count=Count('id'))

    # Annotate PollOptions with the number of votes
    poll_options_with_votes = PollOption.objects.annotate(vote_count=Count('votes'))

    context = {
        'polls_with_votes': polls_with_votes,
        'polls': polls,
        'poll_counts_per_category': poll_counts_per_category,
        'poll_options_with_votes': poll_options_with_votes  # Pass the annotated vote count
    }
    return render(request, 'home/poll_list.html', context)

def create_poll(request):
    # print("Navigated to create_poll")  # Debug statement
    if request.method == 'POST':
        # Get data from the form
        description = request.POST.get('description')
        start_date = request.POST.get('start_date')
        end_date = request.POST.get('end_date')
        poll_limit = request.POST.get('poll_limit')
        status = request.POST.get('status')
        poll_category_id = request.POST.get('poll_category')

        # Create Poll object
        poll_category = PollCategory.objects.get(id=poll_category_id)
        poll = Poll(
            description=description,
            start_date=start_date,
            end_date=end_date,
            poll_limit=poll_limit,
            status=status,
            poll_category=poll_category
        )

        # Save the Poll object
        poll.save()

        # Redirect to the poll list
        return redirect('poll_list')
    else:
        # Pass poll categories to the template
        poll_categories = PollCategory.objects.all()
        return render(request, 'home/create_poll.html', {'poll_categories': poll_categories})

def create_poll_option(request):
    # print("Navigated to create_poll_option") 

    if request.method == 'POST':
        name = request.POST.get('name')
        poll_id = request.POST.get('poll')
        point_id = request.POST.get('point')  
        poll = Poll.objects.get(id=poll_id)
        point = Point.objects.get(id=point_id)
        poll_option = PollOption(
            name=name,
            poll=poll,
            point=point,
        )
        poll_option.save()
        return redirect('poll_list')
    else:
        polls = Poll.objects.all()
        points = Point.objects.all()
        return render(request, 'home/create_poll_option.html', {'points': points, 'polls': polls})

def user_list(request):
    profiles = Profile.objects.all()
    return render(request, 'home/user_list.html', {'profiles': profiles})

class ProfileView(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [AllowAny]  # Ensure the user is authenticated

    def partial_update(self, request, *args, **kwargs):
        # Ensure the user can only update their own profile
        if request.user != self.get_object().user:
            return Response({"detail": "You do not have permission to edit this profile."}, status=403)
        return super().partial_update(request, *args, **kwargs)
    
class RedeemPointsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print(f"Request user: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")

        user_id = request.data.get('user_id')
        points_used = request.data.get('points_used')
        exchange_type_id = request.data.get('point_exchange_type')

        print(f"Data received - user_id: {user_id}, points_used: {points_used}, exchange_type_id: {exchange_type_id}")

        try:
            # Convert points_used to integer and validate input
            points_used = int(points_used)
            if not user_id or not points_used or not exchange_type_id:
                return Response({'error': 'Missing required data'}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch user and calculate total points based on Vote model
            user = User.objects.get(id=user_id)
            # user_points = Vote.objects.filter(user_id=user_id).aggregate(
            #     total_points=Sum('poll_option__point__point')
            # )['total_points'] or 0  
            user_points = user.profile.total_points
            print(f"User {user.username} has {user_points} points. Attempting to use {points_used} points.")

            # Check if user has enough points
            if user_points < points_used:
                print("Insufficient points.")
                return Response({'error': 'Insufficient points'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate remaining points
            remaining_points = user_points - points_used

            # Get the exchange type instance
            exchange_type = PointExchangeType.objects.get(id=exchange_type_id)
            print(f"Exchange type found: {exchange_type}")

            # Create and save the ChangePoints instance
            change_points = ChangePoints.objects.create(
                user=user,
                points_used=points_used,
                remaining_points=remaining_points,
                point_exchange_type=exchange_type
            )
            if user:
                profile, created = Profile.objects.get_or_create(user=user)
                points_to_sub = points_used
                profile.total_points -= points_used  
                profile.save() 
                print(f"Added {points_to_sub} points to user {user.username}'s profile.")
            serializer = ChangePointsSerializer(change_points)
            print("Redemption recorded successfully.")
            return Response({'data': serializer.data, 'remaining_points': remaining_points}, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            print("User not found.")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except PointExchangeType.DoesNotExist:
            print("Exchange type not found.")
            return Response({'error': 'Exchange type not found'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            print("Invalid data: points_used or exchange_type_id not convertible to int.")
            return Response({'error': 'Invalid points or exchange type data'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer

@api_view(['GET'])

def user_points_view(request):
    user_points = Vote.objects.values('user__id', 'user__username').annotate(
        total_points=Sum('poll_option__point__point')
    ).order_by('-total_points')
    
    return Response(user_points)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# Get All Routes

@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/'
    ]
    return Response(routes)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    if request.method == 'GET':
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response({'response': data}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        text = "Hello buddy"
        data = f'Congratulation your API just responded to POST request with text: {text}'
        return Response({'response': data}, status=status.HTTP_200_OK)
    return Response({}, status.HTTP_400_BAD_REQUEST)

# Poll Category ViewSet
class PollCategoryViewSet(viewsets.ModelViewSet):
    queryset = PollCategory.objects.all()
    serializer_class = PollCategorySerializer
    permission_classes = [AllowAny]

# Poll Level ViewSet
class PollLevelViewSet(viewsets.ModelViewSet):
    queryset = PollLevel.objects.all()
    serializer_class = PollLevelSerializer

# User ViewSet
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

# Point Exchange Type ViewSet
class PointExchangeTypeViewSet(viewsets.ModelViewSet):
    queryset = PointExchangeType.objects.all()
    serializer_class = PointExchangeTypeSerializer
    permission_classes = [AllowAny]

# Change Points ViewSet
class ChangePointsViewSet(viewsets.ModelViewSet):
    queryset = ChangePoints.objects.all()
    serializer_class = ChangePointsSerializer
    permission_classes = [AllowAny]

    # Custom action to get total points_used per user
    @action(detail=False, methods=['get'], url_path='total-points-used')
    def total_points_used(self, request):
        # Aggregate points_used for each user
        total_points = (
            ChangePoints.objects.values('user__id', 'user__username')
            .annotate(total_points_used=Sum('points_used'))
            .order_by('-total_points_used')
        )
        
        return Response(total_points)

# Poll ViewSet
class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['poll_category__id']  # Allow searching by poll category ID
    permission_classes = [AllowAny]
    # permission_classes = [IsAuthenticated] 
    
    def get_queryset(self):
        queryset = self.queryset
        category_id = self.request.query_params.get('category', None)
        if category_id is not None:
            queryset = queryset.filter(poll_category__id=category_id)  # Filter by category
        return queryset

# Point ViewSet
class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.all()
    serializer_class = PointSerializer
    permission_classes = [AllowAny]
    
class PollOptionViewSet(viewsets.ModelViewSet):
    queryset = PollOption.objects.all()
    serializer_class = PollOptionSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = PollOption.objects.all()
        poll_id = self.request.query_params.get('poll', None)
        if poll_id is not None:
            queryset = queryset.filter(poll_id=poll_id)
        return queryset

    @action(detail=False, methods=['get'], url_path='vote-results')
    def vote_results(self, request):
        poll_id = request.query_params.get('poll')
        if not poll_id:
            return Response({"error": "Poll ID is required"}, status=400)

        # Get poll options for the poll
        poll_options = PollOption.objects.filter(poll_id=poll_id)

        # Serialize and return vote results
        serializer = VoteResultsSerializer(poll_options, many=True)
        return Response(serializer.data)

class CurrentUserView(APIView):
    permission_classes = [AllowAny]  # Or use IsAuthenticated if needed

    def get(self, request):
        print(f"Request headers: {request.headers}")  # Log the headers to see if the token is present
        print(f"Request user: {request.user}")  # Log the user making the request
        print(f"Is authenticated: {request.user.is_authenticated}")

        if request.user.is_authenticated:
            return Response({
                "isAuthenticated": True,
                "username": request.user.username
            })
        return Response({"isAuthenticated": False})

class VoteView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # Checking if the user/IP has voted
        poll_id = request.query_params.get('poll')
        user_id = request.query_params.get('userId')
        user_ip = request.query_params.get('userIp')

        if not poll_id:
            return Response({"error": "Poll ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            poll = Poll.objects.get(id=poll_id)
        except Poll.DoesNotExist:
            return Response({"error": "Poll not found"}, status=status.HTTP_404_NOT_FOUND)

        has_voted = False

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                has_voted = Vote.objects.filter(poll_option__poll=poll, user=user).exists()
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        elif user_ip:
            has_voted = Vote.objects.filter(poll_option__poll=poll, ip_address=user_ip).exists()

        return Response({"hasVoted": has_voted}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        user_id = request.data.get('userId')
        poll_option_id = request.data.get('optionId')
        user_ip = request.data.get('userIp')

        if not poll_option_id:
            return Response({"error": "Poll option ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            poll_option = PollOption.objects.get(id=poll_option_id)
            poll = poll_option.poll
        except PollOption.DoesNotExist:
            return Response({"error": "Invalid poll option ID"}, status=status.HTTP_404_NOT_FOUND)

        user = None

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                if Vote.objects.filter(poll_option__poll=poll, user=user).exists():
                    return Response({"error": "You have already voted for this option."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        elif user_ip:
            # Directly check if a vote with this IP exists for the poll
            if Vote.objects.filter(poll_option__poll=poll, ip_address=user_ip).exists():
                return Response({"error": "You have already voted for this option."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "User ID or IP address is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the vote with IP address, even if the user is logged in
        vote = Vote.objects.create(
            poll_option=poll_option,
            user=user if user else None,
            ip_address=user_ip
        )

        # Update user's profile points if user exists
        if user:
            profile, created = Profile.objects.get_or_create(user=user)
            profile.total_points += poll_option.point.point
            profile.save()

        return Response({"success": "Vote submitted successfully"}, status=status.HTTP_201_CREATED)

class VoteResultsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        poll_id = request.query_params.get('poll')
        
        # Check if poll ID is provided
        if not poll_id:
            return Response({"error": "Poll ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if poll exists
        try:
            poll = Poll.objects.get(id=poll_id)
        except Poll.DoesNotExist:
            return Response({"error": "Poll not found"}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve poll options and count votes for each
        poll_options = PollOption.objects.filter(poll=poll)
        vote_results = {}

        for option in poll_options:
            vote_count = Vote.objects.filter(poll_option=option).count()
            vote_results[option.id] = vote_count

        return Response(vote_results, status=status.HTTP_200_OK)
    
# Main Poll ViewSet
class MainPollViewSet(viewsets.ModelViewSet):
    queryset = MainPoll.objects.all()
    serializer_class = MainPollSerializer
