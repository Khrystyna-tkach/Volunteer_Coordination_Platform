from django.test import TestCase
from django.urls import reverse
from .models import CustomUser, HelpRequest


class AccountsUnitTests(TestCase):
    def setUp(self):
        # Create users with different roles
        self.user = CustomUser.objects.create_user(
            username='user@example.com',
            email='user@example.com',
            password='password123',
            first_name='User',
            role='user'
        )
        self.volunteer = CustomUser.objects.create_user(
            username='vol@example.com',
            email='vol@example.com',
            password='password123',
            first_name='Volunteer',
            role='volunteer'
        )
        self.admin = CustomUser.objects.create_user(
            username='admin@example.com',
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            role='admin'
        )

    def test_customuser_str_contains_username_and_role(self):
        s = str(self.user)
        self.assertIn(self.user.username, s)
        self.assertIn(self.user.get_role_display(), s)

    def test_helprequest_str(self):
        req = HelpRequest.objects.create(
            title='Help me',
            description='Desc',
            contact_info='012345',
            location='Here',
            author=self.user
        )
        self.assertEqual(str(req), 'Help me')

    def test_register_redirects_by_role_and_creates_user(self):
        data = {
            'name': 'New Volunteer',
            'email': 'newvol@example.com',
            'password': 'pw123456',
            'role': 'volunteer'
        }
        resp = self.client.post(reverse('register'), data)
        self.assertEqual(resp.status_code, 302)
        # new user created
        self.assertTrue(CustomUser.objects.filter(email='newvol@example.com').exists())
        # redirected to volunteer page
        self.assertEqual(resp.url, reverse('volunteer_page'))

    def test_login_view_accepts_correct_credentials_and_redirects(self):
        data = {'email': self.user.email, 'password': 'password123'}
        resp = self.client.post(reverse('login'), data)
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, reverse('user_page'))

    def test_login_view_rejects_bad_credentials(self):
        data = {'email': 'bad@example.com', 'password': 'wrong'}
        resp = self.client.post(reverse('login'), data)
        # stays on login page (rendered) with error message (status 200)
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, 'accounts/login.html')

    def test_user_page_post_creates_helprequest(self):
        self.client.login(username=self.user.email, password='password123')
        data = {
            'title': 'Need help',
            'description': 'Please help me',
            'contact_info': '0123',
            'location': 'City'
        }
        resp = self.client.post(reverse('create_request'), data)
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(HelpRequest.objects.filter(title='Need help', author=self.user).exists())

    def test_volunteer_take_request_changes_status_and_assigns_volunteer(self):
        req = HelpRequest.objects.create(
            title='Task',
            description='Desc',
            contact_info='c',
            location='loc',
            author=self.user,
            status='new'
        )
        self.client.login(username=self.volunteer.email, password='password123')
        resp = self.client.get(reverse('take_request', args=[req.pk]))
        self.assertEqual(resp.status_code, 302)
        req.refresh_from_db()
        self.assertEqual(req.status, 'in_progress')
        self.assertEqual(req.volunteer, self.volunteer)

    def test_update_status_only_allows_assigned_volunteer(self):
        req = HelpRequest.objects.create(
            title='Task2',
            description='Desc',
            contact_info='c',
            location='loc',
            author=self.user,
            status='in_progress',
            volunteer=self.volunteer
        )
        self.client.login(username=self.volunteer.email, password='password123')
        resp = self.client.post(reverse('update_status', args=[req.pk]), {'status': 'completed'})
        self.assertEqual(resp.status_code, 302)
        req.refresh_from_db()
        self.assertEqual(req.status, 'completed')

    def test_admin_page_access_control(self):
        # Non-admin redirected to home
        self.client.login(username=self.user.email, password='password123')
        resp = self.client.get(reverse('admin_page'))
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, reverse('home'))

        # Admin can access
        self.client.login(username=self.admin.email, password='password123')
        resp = self.client.get(reverse('admin_page'))
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, 'accounts/admin_page.html')

    def test_delete_request_by_admin(self):
        req = HelpRequest.objects.create(
            title='ToDelete',
            description='Desc',
            contact_info='x',
            location='loc',
            author=self.user
        )
        self.client.login(username=self.admin.email, password='password123')
        resp = self.client.get(reverse('delete_request', args=[req.pk]))
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(HelpRequest.objects.filter(pk=req.pk).exists())

    def test_edit_request_requires_admin_and_valid_contact_info(self):
        req = HelpRequest.objects.create(
            title='ToEdit',
            description='D',
            contact_info='111',
            location='loc',
            author=self.user
        )
        # Non-admin redirected
        self.client.login(username=self.user.email, password='password123')
        resp = self.client.get(reverse('edit_request', args=[req.pk]))
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, reverse('home'))

        # Admin posts invalid (empty) contact_info -> stays on edit page
        self.client.login(username=self.admin.email, password='password123')
        resp = self.client.post(reverse('edit_request', args=[req.pk]), {
            'title': 'ToEdit',
            'description': 'D2',
            'contact_info': '   ',  # blank after strip
            'location': 'newloc'
        })
        self.assertEqual(resp.status_code, 200)
        self.assertTemplateUsed(resp, 'accounts/edit_request.html')
        req.refresh_from_db()
        # not changed
        self.assertEqual(req.description, 'D')

        # Valid post updates and redirects to admin_page
        resp = self.client.post(reverse('edit_request', args=[req.pk]), {
            'title': 'ToEditUpdated',
            'description': 'D3',
            'contact_info': 'contact',
            'location': 'newloc'
        })
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, reverse('admin_page'))
        req.refresh_from_db()
        self.assertEqual(req.title, 'ToEditUpdated')
        self.assertEqual(req.contact_info, 'contact')

    def test_toggle_user_status_by_admin_and_anchor_redirect(self):
        # Ensure target user active state toggles and redirect contains anchor
        self.client.login(username=self.admin.email, password='password123')
        user_id = self.user.id
        before_state = self.user.is_active
        resp = self.client.get(reverse('toggle_user_status', args=[user_id]))
        self.assertEqual(resp.status_code, 302)
        # redirect should include anchor #user-<id>
        self.assertTrue(resp.url.endswith(f"#user-{user_id}"))
        self.user.refresh_from_db()
        self.assertEqual(self.user.is_active, not before_state)
