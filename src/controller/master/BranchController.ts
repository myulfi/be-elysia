import Elysia from "elysia"
import * as CommonModel from "../../model/CommonModel"
import * as MasterModel from "../../model/MasterModel"
import * as BranchFacade from "../../facade/master/BranchFacade"

const BranchController = new Elysia({})
    .get(
        "/branch.json",
        ({ query, error }) => BranchFacade.get(query, error),
        { query: CommonModel.TableModel }
    )
    .get(
        "/:id/branch.json",
        ({ params: { id }, error }) => BranchFacade.getById(id, error),
        { params: CommonModel.NumericIdModel }
    )
    .post(
        "/branch.json",
        ({ request, body, error }) => BranchFacade.create(request, body, error),
        { body: MasterModel.MasterBranchModel }
    )
    .patch("/:id/branch.json",
        ({ request, params: { id }, body, error }) => BranchFacade.update(request, id, body, error),
        {
            params: CommonModel.NumericIdModel,
            body: MasterModel.MasterBranchModel
        }
    )
    .delete(
        '/:ids/branch.json',
        ({ request, params: { ids }, error }) => BranchFacade.remove(request, ids, error),
        { params: CommonModel.IntegerIdArrayModel }
    )

export default BranchController