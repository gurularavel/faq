<?php

namespace App\Exports;

use App\Http\Resources\App\Exams\ExamsListResource;
use App\Models\QuestionGroup;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ExamsExport implements FromArray, WithHeadings, ShouldAutoSize
{
    private QuestionGroup $questionGroup;

    public function __construct(QuestionGroup $questionGroup)
    {
        $this->questionGroup = $questionGroup;
    }

    /**
     * @return array
     */
    public function array(): array
    {
        $items = $this->questionGroup
            ->exams()
            ->with([
                'user',
                'questions',
            ])
            ->withCount([
                'questions',
                'questions as correct_questions_count' => static function ($query) {
                    $query->where('is_correct', true);
                },
                'questions as incorrect_questions_count' => static function ($query) {
                    $query->where('is_correct', false);
                },
            ])
            ->withSum('questions', 'point')
            ->orderBy('id')
            ->get();

        $jsonData = json_encode(ExamsListResource::collection($items));
        $exams = json_decode($jsonData, true);

        $dataList = [];

        foreach ($exams as $index => $exam) {
            $data = [];

            $user = $exam['user'];

            $status = $exam['is_ended']
                ? 'Bitmiş'
                : ($exam['is_active']
                    ? 'Başlamamış'
                    : 'Başlamış');

            $data[] = $index + 1;
            $data[] = ($user['name'] ?? '') . ' ' . ($user['surname'] ?? '');
            $data[] = $exam['start_date'] ?? '';
            $data[] = $exam['total_time_spent_formatted'] ?? '';
            $data[] = $exam['correct_questions_count'] ?? '';
            $data[] = $exam['incorrect_questions_count'] ?? '';
            $data[] = $exam['success_rate'] ?? '';
            $data[] = $exam['point'] ?? '';
            $data[] = $status;

            $dataList[] = $data;
        }

        return $dataList;
    }

    public function headings(): array
    {
        return [
            'No',
            'İstifadəçi',
            'Başlama vaxtı',
            'Keçirilən vaxt',
            'Düz',
            'Səhv',
            'Faizlə',
            'Xal',
            'Status',
        ];
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
