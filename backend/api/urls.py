from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    PollCategoryViewSet, PollLevelViewSet,  
    PointExchangeTypeViewSet, ChangePointsViewSet, PollViewSet, 
    PointViewSet, PollOptionViewSet, MainPollViewSet, VoteView, VoteResultsView, VoteViewSet, user_points_view, RedeemPointsView, ProfileView
)
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
router = DefaultRouter()
router.register(r'poll-categories', PollCategoryViewSet)
router.register(r'poll-levels', PollLevelViewSet)
# router.register(r'users', UserViewSet)
router.register(r'point-exchange-types', PointExchangeTypeViewSet)
router.register(r'change-points', ChangePointsViewSet)
router.register(r'polls', PollViewSet)
router.register(r'points', PointViewSet)
router.register(r'poll-options', PollOptionViewSet, basename='poll-option')
router.register(r'main-polls', MainPollViewSet)
router.register(r'votes', VoteViewSet)
router.register(r'profile', ProfileView, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('vote/', VoteView.as_view(), name='vote'),
    path('vote-results/', VoteResultsView.as_view(), name='vote-results'),
    path('user-points/', user_points_view, name='user_points'),
    path('redeem-points/', RedeemPointsView.as_view(), name='redeem-points'),
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('test/', views.testEndPoint, name='test'),
    path('', views.getRoutes),
    
    
]
