<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class LDAPService
{
    private static ?LDAPService $instance = null;

    private function __construct()
    {

    }

    public static function instance(): LDAPService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function check(User $user, string $password): bool
    {
        if (config('app.static_login_username') && config('app.static_login_password')) {
            return $user->samaccountname === config('app.static_login_username') && $password === config('app.static_login_password');
        }

        $attempt = Auth::guard('ldap')->attempt([
            'samaccountname' => $user->samaccountname,
            //'userprincipalname' => $user->email,
            'password' => $password,
        ]);

        if ($attempt) {
            $ldapUser = Auth::guard('ldap')->user();

            if ($ldapUser) {
                $this->updateUserLDAPData($user, $ldapUser);

                return true;
            }
        }

        return false;
    }

    private function updateUserLDAPData(User $user, $ldapUser): void
    {
        $user->update([
            'samaccountname' => $ldapUser?->samaccountname[0] ?? null,
            'objectguid' => $ldapUser?->getConvertedGuid() ?? null,
            'displayname' => $ldapUser?->displayname[0] ?? null,
            'distinguishedname' => $ldapUser?->distinguishedname[0] ?? null,
            'lastlogon' => Carbon::parse($ldapUser->lastlogon)?->toDateTimeString() ?? null,
            'accountexpires' => $ldapUser?->accountexpires ?? null,
        ]);
    }
}
