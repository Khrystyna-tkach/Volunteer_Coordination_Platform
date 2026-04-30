from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'Користувач'),
        ('volunteer', 'Волонтер'),
        ('admin', 'Адміністратор'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user', verbose_name="Роль")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class HelpRequest(models.Model): 
    STATUS_CHOICES = (
        ('new', 'Нова'),
        ('in_progress', 'В процесі'),
        ('completed', 'Виконана'),
    )

    title = models.CharField(max_length=255, verbose_name="Назва проблеми")
    description = models.TextField(verbose_name="Опис проблеми")
    contact_info = models.CharField(max_length=255, verbose_name="Контактні дані")
    location = models.CharField(max_length=255, verbose_name="Локація/Адреса")
    category = models.CharField(max_length=100, verbose_name="Категорія", blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Статус")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")
    
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='requests_created', verbose_name="Автор заявки")
    volunteer = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests_assigned', verbose_name="Волонтер")

    def __str__(self):
        return self.title