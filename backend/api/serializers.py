from rest_framework import serializers
from .models import (
    PollCategory, PollLevel, PointExchangeType, 
    ChangePoints, Poll, Point, PollOption, MainPoll, Vote, Profile
)
from api.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    date_joined = serializers.CharField(source='user.date_joined', read_only=True)

    class Meta:
        model = Profile
        fields = ['date_joined', 'username', 'email', 'id', 'user', 'full_name', 'bio', 'image', 'verified', 'total_points', 'phone', 'address']
        read_only_fields = ['user', 'total_points']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # These are claims, you can add custom claims
        token['full_name'] = user.profile.full_name
        token['username'] = user.username
        token['email'] = user.email
        token['bio'] = user.profile.bio
        token['image'] = str(user.profile.image)
        token['verified'] = user.profile.verified
        # ...
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    age_range = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    location = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'age_range', 'phone', 'location')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Extract profile-specific data
        age_range = validated_data.pop('age_range', None)
        phone = validated_data.pop('phone', None)
        location = validated_data.pop('location', None)

        # Create user instance
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()

        # Get the auto-created profile
        profile = user.profile  # Access via the reverse relationship
        profile.age_range = age_range
        profile.phone = phone
        profile.address = location
        profile.save()

        return user

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserModel
#         fields = ('user_id', 'email', 'username')

# Poll Category Serializer
class PollCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PollCategory
        fields = ['id', 'name']

# Poll Serializer
class PollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poll
        fields = '__all__'

# Poll Option Serializer
class PollOptionSerializer(serializers.ModelSerializer):
    point = serializers.IntegerField(source='point.point')
    class Meta:
        model = PollOption
        fields = '__all__'

class VoteSerializer(serializers.ModelSerializer):
    poll_option = PollOptionSerializer() 
    class Meta:
        model = Vote
        fields = ['id','poll_option', 'user', 'ip_address', 'voted_at']

class VoteResultsSerializer(serializers.ModelSerializer):
    vote_count = serializers.SerializerMethodField()

    class Meta:
        model = PollOption
        fields = ['id', 'name', 'vote_count']

    def get_vote_count(self, obj):
        # Count the votes for this PollOption
        return Vote.objects.filter(poll_option=obj).count()

# Poll Level Serializer
class PollLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollLevel
        fields = ['id', 'name', 'point_value']

# Point Exchange Type Serializer
class PointExchangeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointExchangeType
        fields = ['id', 'name']

# Serializer for ChangePoints model
class ChangePointsSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Include user details
    point_exchange_type = PointExchangeTypeSerializer()  # Include point exchange type details

    class Meta:
        model = ChangePoints
        fields = ['id', 'user', 'points_used', 'remaining_points', 'point_exchange_type', 'created_at']

# Point Serializer
class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = ['id', 'point']

# Main Poll Serializer
class MainPollSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # To include user details
    poll = PollSerializer()  # To include poll details
    poll_option = PollOptionSerializer()  # To include poll option details
    point = PointSerializer()  # To include point details

    class Meta:
        model = MainPoll
        fields = ['id', 'user', 'poll', 'poll_option', 'point']
