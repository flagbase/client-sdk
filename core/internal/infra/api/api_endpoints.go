package api

import (
	"core/internal/app/access"
	"core/internal/app/evaluation"
	flagtransport "core/internal/app/flag/transport"
	"core/internal/app/healthcheck"
	identitytransport "core/internal/app/identity/transport"
	projecttransport "core/internal/app/project/transport"
	"core/internal/app/segment"
	"core/internal/app/targeting"
	traittransport "core/internal/app/trait/transport"
	workspacetransport "core/internal/app/workspace/transport"
	"core/internal/pkg/httpmetrics"
	"core/internal/pkg/srvenv"

	"github.com/gin-gonic/gin"
)

// ApplyRoutes applies route from all packages to root handler
func ApplyRoutes(senv *srvenv.Env, r *gin.Engine) {
	httpmetrics.ApplyMetrics(r, "api")
	root := r.Group("/")
	access.ApplyRoutes(senv, root)
	flagtransport.ApplyRoutes(senv, root)
	evaluation.ApplyRoutes(senv, root)
	healthcheck.ApplyRoutes(senv, root)
	identitytransport.ApplyRoutes(senv, root)
	projecttransport.ApplyRoutes(senv, root)
	targeting.ApplyRoutes(senv, root)
	traittransport.ApplyRoutes(senv, root)
	segment.ApplyRoutes(senv, root)
	workspacetransport.ApplyRoutes(senv, root)
}