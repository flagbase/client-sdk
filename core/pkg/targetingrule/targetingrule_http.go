package targetingrule

import (
	cons "core/internal/constants"
	"core/internal/httputils"
	"core/internal/patch"
	rsc "core/internal/resource"
	res "core/internal/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ApplyRoutes targeting route handlers
func ApplyRoutes(r *gin.RouterGroup) {
	routes := r.Group(rsc.RouteTargetingRule)
	rootPath := httputils.BuildPath(
		rsc.WorkspaceKey,
		rsc.ProjectKey,
		rsc.FlagKey,
		rsc.EnvironmentKey,
	)
	resourcePath := httputils.AppendPath(
		rootPath,
		rsc.RuleKey,
	)

	routes.POST(rootPath, createHTTPHandler)
	routes.GET(resourcePath, getHTTPHandler)
	routes.PATCH(resourcePath, updateHTTPHandler)
	routes.DELETE(resourcePath, deleteHTTPHandler)
}

func listHTTPHandler(ctx *gin.Context) {
	var e res.Errors

	atk, err := httputils.ExtractATK(ctx)
	if err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	data, _err := List(
		atk,
		httputils.GetParam(ctx, rsc.WorkspaceKey),
		httputils.GetParam(ctx, rsc.ProjectKey),
		httputils.GetParam(ctx, rsc.FlagKey),
		httputils.GetParam(ctx, rsc.EnvironmentKey),
	)
	if !_err.IsEmpty() {
		e.Extend(_err)
	}

	httputils.Send(
		ctx,
		http.StatusOK,
		data,
		http.StatusInternalServerError,
		e,
	)
}

func createHTTPHandler(ctx *gin.Context) {
	var e res.Errors

	atk, err := httputils.ExtractATK(ctx)
	if err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	var i TargetingRule
	if err := ctx.BindJSON(&i); err != nil {
		e.Append(cons.ErrorInternal, err.Error())
	}

	data, _err := Create(
		atk,
		i,
		httputils.GetParam(ctx, rsc.WorkspaceKey),
		httputils.GetParam(ctx, rsc.ProjectKey),
		httputils.GetParam(ctx, rsc.FlagKey),
		httputils.GetParam(ctx, rsc.EnvironmentKey),
	)
	if !_err.IsEmpty() {
		e.Extend(_err)
	}

	httputils.Send(
		ctx,
		http.StatusCreated,
		data,
		http.StatusInternalServerError,
		e,
	)
}

func getHTTPHandler(ctx *gin.Context) {
	var e res.Errors

	atk, err := httputils.ExtractATK(ctx)
	if err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	data, _err := Get(
		atk,
		httputils.GetParam(ctx, rsc.WorkspaceKey),
		httputils.GetParam(ctx, rsc.ProjectKey),
		httputils.GetParam(ctx, rsc.FlagKey),
		httputils.GetParam(ctx, rsc.EnvironmentKey),
		httputils.GetParam(ctx, rsc.RuleKey),
	)
	if !_err.IsEmpty() {
		e.Extend(_err)
	}

	httputils.Send(
		ctx,
		http.StatusOK,
		data,
		http.StatusInternalServerError,
		e,
	)
}

func updateHTTPHandler(ctx *gin.Context) {
	var e res.Errors
	var i patch.Patch

	atk, err := httputils.ExtractATK(ctx)
	if err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	if err := ctx.BindJSON(&i); err != nil {
		e.Append(cons.ErrorInternal, err.Error())
	}

	data, _err := Update(
		atk,
		i,
		httputils.GetParam(ctx, rsc.WorkspaceKey),
		httputils.GetParam(ctx, rsc.ProjectKey),
		httputils.GetParam(ctx, rsc.FlagKey),
		httputils.GetParam(ctx, rsc.EnvironmentKey),
		httputils.GetParam(ctx, rsc.RuleKey),
	)
	if !_err.IsEmpty() {
		e.Extend(_err)
	}

	httputils.Send(
		ctx,
		http.StatusOK,
		data,
		http.StatusInternalServerError,
		e,
	)
}

func deleteHTTPHandler(ctx *gin.Context) {
	var e res.Errors

	atk, err := httputils.ExtractATK(ctx)
	if err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	if err := Delete(
		atk,
		httputils.GetParam(ctx, rsc.WorkspaceKey),
		httputils.GetParam(ctx, rsc.ProjectKey),
		httputils.GetParam(ctx, rsc.FlagKey),
		httputils.GetParam(ctx, rsc.EnvironmentKey),
		httputils.GetParam(ctx, rsc.RuleKey),
	); !err.IsEmpty() {
		e.Extend(err)
	}

	httputils.Send(
		ctx,
		http.StatusNoContent,
		&res.Success{},
		http.StatusInternalServerError,
		e,
	)
}
