<?php

namespace App\Services;

use App\Enum\NotificationTypeEnum;
use App\Models\Notification;
use App\Models\QuestionGroup;
use Illuminate\Database\Eloquent\Model;

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
            'type' => $type->value,
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
            }

            $notification->setLang('title', $title, $language['id']);
            $notification->setLang('message', $message, $language['id']);
        }

        $notification->saveLang();

        $this->notification = $notification;

        return $notification;
    }

    public function sendToDepartments(array $departmentIds, NotificationTypeEnum $type, ?Model $typeableModel = null): void
    {
        if (empty($departmentIds)) {
            return;
        }

        if ($this->notification === null) {
            $this->createNotification($type, $typeableModel);
        }

        $this->notification->departments()->sync($departmentIds);
    }

    public function sendToUsers(array $userIds, NotificationTypeEnum $type, ?Model $typeableModel = null): void
    {
        if (empty($userIds)) {
            return;
        }

        if ($this->notification === null) {
            $this->createNotification($type, $typeableModel);
        }

        $this->notification->users()->sync($userIds);
    }
}
