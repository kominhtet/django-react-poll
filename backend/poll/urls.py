# main urls.py (in the project directory)
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from api.views import index, poll_list, create_poll, user_list, create_poll_option

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')), 
    path('', index, name='index'),
    path('polls/', poll_list, name='poll_list'),  # Trailing slash
    path('polls/create/', create_poll, name='create_poll'),  # Trailing slash
    # Updated path with poll_id included in the URL
    path('create_poll_option/', create_poll_option, name='create_poll_option'),  
    
    path('user_list', user_list, name='user_list'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
