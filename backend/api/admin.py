from django.contrib import admin
from api.models import User,Profile, PollLevel, PointExchangeType, ChangePoints, Poll, PollCategory, Point, PollOption, Vote

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email']


class ProfileAdmin(admin.ModelAdmin):
    list_editable = ['verified']
    list_display = ['user', 'full_name' ,'verified']

admin.site.register(User, UserAdmin)
admin.site.register( Profile,ProfileAdmin)
admin.site.register( PollLevel)
admin.site.register( PointExchangeType)
admin.site.register( ChangePoints)
admin.site.register( PollCategory)
admin.site.register( Poll)
admin.site.register( PollOption)
admin.site.register( Vote)
admin.site.register( Point)