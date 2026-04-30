from django.contrib import admin
from .models import CustomUser, HelpRequest

admin.site.register(CustomUser)
admin.site.register(HelpRequest)