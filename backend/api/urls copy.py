# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PollViewSet, PollOptionViewSet, PollCategoryViewSet

router = DefaultRouter()
router.register(r'poll-category', PollCategoryViewSet)
router.register(r'polls', PollViewSet)
router.register(r'poll-options', PollOptionViewSet, basename='poll-option')

urlpatterns = [
    path('', include(router.urls)),
]
