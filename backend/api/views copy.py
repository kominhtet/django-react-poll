# views.py
from rest_framework import viewsets
from .models import Poll, PollOption, Category
from .serializers import PollSerializer, PollOptionSerializer, PollCategorySerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class PollCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = PollCategorySerializer

class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    serializer_class = PollSerializer

class PollOptionViewSet(viewsets.ModelViewSet):
    queryset = PollOption.objects.all()
    serializer_class = PollOptionSerializer

    @action(detail=True, methods=['post'])
    def vote(self, request, pk=None):
        option = self.get_object()
        option.total_vote += 1
        option.save()
        return Response({'status': 'vote counted'}, status=status.HTTP_200_OK)
