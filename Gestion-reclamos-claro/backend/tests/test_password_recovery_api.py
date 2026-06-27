from django.test import TransactionTestCase

from business_logic.auth import (
    InvalidCredentialsError,
    PasswordRecoveryError,
    confirm_password_recovery,
    login,
    request_password_recovery,
)
from schemas.auth import (
    LoginIn,
    LoginRole,
    PasswordRecoveryConfirmIn,
    PasswordRecoveryRequestIn,
)


class PasswordRecoveryApiTests(TransactionTestCase):
    serialized_rollback = True

    def test_request_password_recovery_returns_masked_contact(self):
        response = request_password_recovery(
            PasswordRecoveryRequestIn(
                account_type=LoginRole.CLIENT_PERSON,
                identifier="cliente.persona@demo.com",
            )
        )

        self.assertTrue(response.ok)
        self.assertIn("@", response.masked_contact)
        self.assertEqual(response.demo_code, "123456")

    def test_confirm_password_recovery_updates_login_password(self):
        confirm_password_recovery(
            PasswordRecoveryConfirmIn(
                account_type=LoginRole.CLIENT_PERSON,
                identifier="cliente.persona@demo.com",
                otp="123456",
                new_password="NuevaClave123",
            )
        )

        with self.assertRaises(InvalidCredentialsError):
            login(
                LoginIn(
                    username="cliente.persona@demo.com",
                    password="1234",
                    role=LoginRole.CLIENT_PERSON,
                )
            )

        session = login(
            LoginIn(
                username="cliente.persona@demo.com",
                password="NuevaClave123",
                role=LoginRole.CLIENT_PERSON,
            )
        )
        self.assertEqual(session.user.username, "cliente.persona@demo.com")

    def test_confirm_password_recovery_rejects_invalid_otp(self):
        with self.assertRaises(PasswordRecoveryError):
            confirm_password_recovery(
                PasswordRecoveryConfirmIn(
                    account_type=LoginRole.CLIENT_PERSON,
                    identifier="cliente.persona@demo.com",
                    otp="000000",
                    new_password="NuevaClave123",
                )
            )
