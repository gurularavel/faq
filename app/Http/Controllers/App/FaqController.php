<?php

namespace App\Http\Controllers\App;

use App\Enum\FaqListTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\App\Exams\ExamChooseAnswerRequest;
use App\Http\Requests\App\Faqs\FaqSearchRequest;
use App\Http\Resources\Admin\Faqs\FaqsListResource;
use App\Http\Resources\App\Exams\ExamsListResource;
use App\Http\Resources\App\Exams\QuestionsListResource;
use App\Models\Exam;
use App\Repositories\FaqRepository;
use App\Services\ExamService;
use App\Services\LangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class FaqController extends Controller
{
    private FaqRepository $repo;

    public function __construct(FaqRepository $repo)
    {
        $this->repo = $repo;
    }

    /**
     * @OA\Get(
     *     path="/api/app/faqs/search",
     *     summary="Search FAQ",
     *     tags={"AppFAQ"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *               @OA\Parameter(
     *           name="parameters",
     *           in="query",
     *           description="Search request parameters",
     *           required=true,
     *           @OA\Schema(ref="#/components/schemas/FaqSearchRequest")
     *       ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function search(FaqSearchRequest $request): AnonymousResourceCollection
    {
        $validated = $request->validated();

        return FaqsListResource::collection($this->repo->fuzzySearch($validated));
    }

    /**
     * @OA\Get(
     *     path="/api/app/faqs/most-searched",
     *     summary="Most Searched FAQ",
     *     tags={"AppFAQ"},
     *          security={
     *           {
     *               "AppApiToken": {},
     *               "AppSanctumBearerToken": {}
     *           }
     *       },
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/FaqsListResource"))
     *     )
     * )
     */
    public function getMostSearchedItems(): AnonymousResourceCollection
    {
        return FaqsListResource::collection($this->repo->getFaqFromList(FaqListTypeEnum::SEARCH));
    }
}
