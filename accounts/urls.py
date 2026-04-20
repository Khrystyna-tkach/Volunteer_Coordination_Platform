from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.user_page, name='user_page'),
    path('user/create/', views.user_page, name='create_request'), 
    path('volunteer/', views.volunteer_page, name='volunteer_page'),
    path('take_request/<int:pk>/', views.take_request, name='take_request'),
    path('admin_panel/', views.admin_page, name='admin_page'),
    path('volunteer/', views.volunteer_page, name='volunteer_page'),
    path('take_request/<int:pk>/', views.take_request, name='take_request'),
    path('update_status/<int:pk>/', views.update_status, name='update_status'), 
    path('admin_panel/', views.admin_page, name='admin_page'),
    path('delete_request/<int:pk>/', views.delete_request, name='delete_request'),
    path('toggle_user/<int:user_id>/', views.toggle_user_status, name='toggle_user_status'),
    path('edit_request/<int:pk>/', views.edit_request, name='edit_request'),
    path('admin_change_status/<int:pk>/', views.admin_change_status, name='admin_change_status'),
]