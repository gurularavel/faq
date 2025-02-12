<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\App\Exams\ExamsListResource;
use App\Models\User;
use App\Services\ExamService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

class ExamController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/control/users/{user}/exams/list",
     *     summary="Get list of user's exams",
     *     tags={"UserExams"},
     *           security={
     *              {
     *                  "ApiToken": {},
     *                  "SanctumBearerToken": {}
     *              }
     *         },
     *                    @OA\Parameter(
     *            name="user",
     *            in="path",
     *            required=true,
     *            @OA\Schema(type="integer")
     *        ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/ExamsListResource"))
     *     )
     * )
     */
    public function list(User $user): AnonymousResourceCollection
    {
        ExamService::instance()->setUser($user);

        return ExamsListResource::collection(ExamService::instance()->getUserExams());
    }
}
