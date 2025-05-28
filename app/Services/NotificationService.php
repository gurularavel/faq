<?php

namespace App\Services;

use App\Enum\NotificationTypeEnum;
use App\Models\Faq;
use App\Models\Notification;
use App\Models\QuestionGroup;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class NotificationService
{
    private static ?NotificationService $instance = null;
    private ?Notification $notification = null;

    private function __construct()
    {

    }

    public static function instance(): NotificationService
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function createNotification(NotificationTypeEnum $type, ?Model $typeableModel = null): Notification
    {
        $notification = Notification::query()->create([
            'type' => $type->value === NotificationTypeEnum::FAQ_NEW->value ? NotificationTypeEnum::FAQ->value : $type->value,
            'typeable_type' => $typeableModel?->getMorphClass() ?? null,
            'typeable_id' => $typeableModel?->id ?? null,
        ]);

        $languages = LangService::instance()->getLanguages();

        $title = 'New notification';
        $message = 'New notification';

        foreach ($languages as $language) {
            if ($type == NotificationTypeEnum::EXAM) {
                /** @var QuestionGroup $typeableModel */

                $title = LangService::instance()
                    ->setDefault('You have a new exam!')
                    ->getLang('you_have_a_new_exam', [], $language['key']);

                $message = LangService::instance()
                    ->setDefault('A new exam has been assigned for you: @exam')
                    ->getLang('new_exam_assigned_for_you', ['@exam' => $typeableModel->getLang('title', $language['id'])], $language['key']);
            } else if ($type == NotificationTypeEnum::FAQ) {
                /** @var Faq $typeableModel */

                $title = LangService::instance()
                    ->setDefault('FAQ updated!')
                    ->getLang('notification_faq_updated_title', [], $language['key']);

                $message = LangService::instance()
                    ->setDefault('This FAQ was updated: @faq')
                    ->getLang('notification_faq_updated_message', ['@faq' => $typeableModel->getLang('question', $language['id'])], $language['key']);
            } else if ($type == NotificationTypeEnum::FAQ_NEW) {
                /** @var Faq $typeableModel */

                $title = LangService::instance()
                    ->setDefault('FAQ created!')
                    ->getLang('notification_faq_created_title', [], $language['key']);

                $message = LangService::instance()
                    ->setDefault('This FAQ was created: @faq')
                    ->getLang('notification_faq_created_message', ['@faq' => $typeableModel->getLang('question', $language['id'])], $language['key']);
            }

            $notification->setLang('title', $title, $language['id']);
            $notification->setLang('message', $message, $language['id']);
        }

        $notification->saveLang();

        $this->notification = $notification;

        return $notification;
    }

    public function sendToUsers(array $userIds, NotificationTypeEnum $type, ?Model $typeableModel = null): void
    {
        if (empty($userIds)) {
            return;
        }

        if ($this->notification === null) {
            $this->createNotification($type, $typeableModel);
        }

        $now = Carbon::now();

        $userPivotData = array_fill_keys($userIds, [
            'created_at' => $now,
        ]);

        $this->notification->users()->sync($userPivotData);
    }

    public function getUserNotifications(): Collection
    {
        /** @var User $user */
        $user = auth('user')->user();

        return Notification::query()
            ->with([
                'translatable',
                'usersRel' => static function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                    $query->orderByDesc('id');
                    $query->limit(1);
                },
            ])
            ->withExists([
                'usersRel' => static function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                    $query->whereNotNull('read_at');
                },
            ])
            ->whereHas('usersRel', static function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderByDesc('id')
            ->limit(50)
            ->get();
    }

    public function getNotification(Notification $notification): Notification
    {
        /** @var User $user */
        $user = auth('user')->user();

        $notification->load([
            'usersRel' => static function ($query) use ($user) {
                $query->where('user_id', $user->id);
                $query->orderByDesc('id');
                $query->limit(1);
            },
        ]);

        $belongsToUser = $notification->usersRel->contains('user_id', $user->id);

        if (!$belongsToUser) {
            throw new AccessDeniedHttpException(
                LangService::instance()
                    ->setDefault('Access denied!')
                    ->getLang('access_denied')
            );
        }

        $this->setSeen($notification);

        $notification
            ->load([
                'translatable',
            ])
            ->loadExists([
                'usersRel' => static function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                    $query->whereNotNull('read_at');
                },
            ]);

        return $notification;
    }

    public function setSeen(Notification $notification): void
    {
        /** @var User $user */
        $user = auth('user')->user();

        $rel = $notification->usersRel()->where('user_id', $user->id)->firstOrFail();

        if ($rel->read_at !== null) {
            return;
        }

        $rel->read_at = Carbon::now();
        $rel->save();
    }

    public function setSeenBulk(): void
    {
        /** @var User $user */
        $user = auth('user')->user();

        $user->notificationsRel()
            ->whereNull('read_at')
            ->update([
                'read_at' => Carbon::now(),
            ]);
    }
}
