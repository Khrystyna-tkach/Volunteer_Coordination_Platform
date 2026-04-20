from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from .models import CustomUser, HelpRequest

# Головна сторінка
def home(request):
    return render(request, 'accounts/home.html')

# Реєстрація
def register_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        role = request.POST.get('role')

        user = CustomUser.objects.create_user(
            username=email, 
            email=email, 
            password=password, 
            first_name=name,
            role=role
        )
        login(request, user)
        # Редирект залежно від ролі після реєстрації
        if user.role == 'volunteer': return redirect('volunteer_page')
        elif user.role == 'admin': return redirect('admin_page')
        return redirect('user_page')
    return render(request, 'accounts/register.html')

# Вхід
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            if user.role == 'volunteer': return redirect('volunteer_page')
            elif user.role == 'admin': return redirect('admin_page')
            return redirect('user_page')
    return render(request, 'accounts/login.html')

# Сторінка Користувача (створення та перегляд заявок)
@login_required
def user_page(request):
    if request.method == 'POST':
        # Логіка створення заявки
        HelpRequest.objects.create(
            title=request.POST.get('title'),
            description=request.POST.get('description'),
            contact_info=request.POST.get('contact_info'),
            location=request.POST.get('location'),
            author=request.user # Автоматично прив'язуємо до того, хто увійшов
        )
        return redirect('user_page') # Перезавантажуємо сторінку після створення
    
    user_requests = HelpRequest.objects.filter(author=request.user)
    return render(request, 'accounts/user_page.html', {'user_requests': user_requests})

# Сторінка Волонтера
@login_required
def volunteer_page(request):
    available_requests = HelpRequest.objects.filter(status='new')
    my_tasks = HelpRequest.objects.filter(volunteer=request.user)
    return render(request, 'accounts/volunteer_page.html', {
        'available_requests': available_requests,
        'my_tasks': my_tasks
    })

# Логіка для волонтера: взяти заявку
@login_required
def take_request(request, pk):
    req = HelpRequest.objects.get(pk=pk)
    req.volunteer = request.user
    req.status = 'in_progress'
    req.save()
    return redirect('volunteer_page')

# Сторінка Адміна
@login_required
def admin_page(request):
    if request.user.role != 'admin':
        return redirect('home')
    all_requests = HelpRequest.objects.all()
    all_users = CustomUser.objects.all()
    return render(request, 'accounts/admin_page.html', {
        'all_requests': all_requests,
        'all_users': all_users
    })

def logout_view(request):
    logout(request)
    return redirect('home')

@login_required
def update_status(request, pk):
    if request.method == 'POST':
        req = get_object_or_404(HelpRequest, pk=pk)
        # Перевіряємо, чи цей волонтер має право редагувати цю заявку
        if req.volunteer == request.user:
            new_status = request.POST.get('status')
            req.status = new_status
            req.save()
    return redirect('volunteer_page')

# Видалення заявки (тільки для адміна)
@login_required
def delete_request(request, pk):
    if request.user.role == 'admin':
        req = get_object_or_404(HelpRequest, pk=pk)
        req.delete()
    return redirect('admin_page')

# Блокування/Розблокування користувача
@login_required
def toggle_user_status(request, user_id):
    if request.user.role == 'admin':
        user_to_change = get_object_or_404(CustomUser, id=user_id)
        if user_to_change != request.user:
            user_to_change.is_active = not user_to_change.is_active
            user_to_change.save()
    
    # Створюємо посилання на адмін-панель з додаванням якоря #user-ID
    url = reverse('admin_page') + f"#user-{user_id}"
    return redirect(url)

@login_required
def edit_request(request, pk):
    # Отримуємо конкретну заявку за її ID
    req = get_object_or_404(HelpRequest, pk=pk)
    
    # Тільки адмін може редагувати тут
    if request.user.role != 'admin':
        return redirect('home')

    if request.method == 'POST':
        # Оновлюємо поля моделі даними з форми
        req.title = request.POST.get('title')
        req.description = request.POST.get('description')
        req.contact_info = request.POST.get('contact_info')
        req.location = request.POST.get('location')
        req.save() # Зберігаємо в базу
        return redirect('admin_page') # Повертаємось в адмінку

    return render(request, 'accounts/edit_request.html', {'req': req})

@login_required
def admin_change_status(request, pk):
    if request.user.role == 'admin' and request.method == 'POST':
        req = get_object_or_404(HelpRequest, pk=pk)
        new_status = request.POST.get('status')
        if new_status in ['new', 'in_progress', 'completed']:
            req.status = new_status
            req.save()
    
    # Повертаємо адміна до конкретної заявки за допомогою якоря
    return redirect(reverse('admin_page') + f"#req-{pk}")