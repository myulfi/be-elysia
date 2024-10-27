import Elysia from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as MasterModel from "../../model/MasterModel"
import * as BranchFacade from "../../facade/master/BranchFacade"

const BranchController = new Elysia({})
    .get(
        "/branch.json",
        ({ query }) => BranchFacade.get(query),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/branch.json",
        ({ params: { id } }) => BranchFacade.getById(id),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/branch.json",
        ({ request, body }) => BranchFacade.create(request, body),
        { body: MasterModel.MasterBranchModel }
    )
    .patch("/:id/branch.json",
        ({ request, params: { id }, body }) => BranchFacade.update(request, id, body),
        {
            params: CommonModel.NumericIdModel,
            body: MasterModel.MasterBranchModel
        }
    )
    .delete(
        '/:ids/branch.json',
        ({ request, params: { ids } }) => BranchFacade.remove(request, ids),
        { params: CommonModel.IntegerIdArrayModel }
    )

export default BranchController