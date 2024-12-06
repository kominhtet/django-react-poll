from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


    def profile(self):
        profile = Profile.objects.get(user=self)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=1000)
    bio = models.CharField(max_length=100)
    image = models.ImageField(upload_to="user_images", default="default.jpg")
    verified = models.BooleanField(default=False)
    total_points = models.IntegerField(default=0)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    age_range = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - Total Points: {self.total_points}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# Poll Category Model
class PollCategory(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class PollSubCategory(models.Model):
    name = models.CharField(max_length=255)
    poll_category = models.ForeignKey(PollCategory, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

# Poll Level Model
class PollLevel(models.Model):
    name = models.CharField(max_length=255)
    point_value = models.IntegerField()

    def __str__(self):
        return self.name

# Users Model
# class User(models.Model):
#     username = models.CharField(max_length=255)
#     email = models.EmailField()
#     address = models.CharField(max_length=255)
#     is_anonymous = models.BooleanField(default=False)
#     session_token = models.CharField(max_length=255)
#     ip_address = models.GenericIPAddressField()
#     total_points = models.IntegerField(default=0)
#     poll_level = models.ForeignKey(PollLevel, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.username

class PointExchangeType(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

# Change Points Model
class ChangePoints(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Associate redemption with a user
    points_used = models.IntegerField()
    remaining_points = models.IntegerField()
    point_exchange_type = models.ForeignKey(PointExchangeType, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChangePoints(user={self.user.username}, points_used={self.points_used})"

# Poll Model
class Poll(models.Model):
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    poll_limit = models.IntegerField()
    status = models.CharField(max_length=255)
    poll_category = models.ForeignKey(PollCategory, on_delete=models.CASCADE)

    def __str__(self):
        return self.description

# Point Model
class Point(models.Model):
    point = models.IntegerField()

    def __str__(self):
        return str(self.point)

# Poll Option Model
class PollOption(models.Model):
    name = models.CharField(max_length=255)
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    point = models.ForeignKey(Point, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        
        return f"{self.poll} -> {self.name}"
    
class Vote(models.Model):
    poll_option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    voted_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):       
        return f"{self.poll_option} -> {self.user}"
    
# Main Poll Model
class MainPoll(models.Model):
    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    poll_option = models.ForeignKey(PollOption, on_delete=models.CASCADE)
    point = models.ForeignKey(Point, on_delete=models.CASCADE)

    def __str__(self):
        return f"MainPoll(user={self.user}, poll={self.poll}, option={self.poll_option})"
