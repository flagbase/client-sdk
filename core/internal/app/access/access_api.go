package access

import (
	srv "core/internal/infra/server"
	"core/internal/pkg/httputil"
	rsc "core/internal/pkg/resource"
	res "core/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ApplyRoutes access route handlers
func ApplyRoutes(sctx *srv.Ctx, r *gin.RouterGroup) {
	routes := r.Group(rsc.RouteAccess)
	routes.POST("/token", httputil.Handler(sctx, generateTokenAPIHandler))
}

func generateTokenAPIHandler(sctx *srv.Ctx, ctx *gin.Context) {
	var i KeySecretPair
	if err := ctx.BindJSON(&i); err != nil {
		return
	}

	r, err := GenerateToken(sctx, i)
	if err.Errors != nil {
		ctx.AbortWithStatusJSON(http.StatusOK, err)
		return
	}

	ctx.JSON(http.StatusInternalServerError, &res.Success{
		Data: r,
	})
}
