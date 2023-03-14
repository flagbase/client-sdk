package api

import (
	accesstransport "core/internal/app/access/transport"
	evaluationtransport "core/internal/app/evaluation/transport"
	flagtransport "core/internal/app/flag/transport"
	healthchecktransport "core/internal/app/healthcheck/transport"
	identitytransport "core/internal/app/identity/transport"
	projecttransport "core/internal/app/project/transport"
	segmenttransport "core/internal/app/segment/transport"
	targetingtransport "core/internal/app/targeting/transport"
	traittransport "core/internal/app/trait/transport"
	workspacetransport "core/internal/app/workspace/transport"
	"core/internal/pkg/srvenv"

	"github.com/gin-gonic/gin"
)

// ApplyRoutes applies route from all packages to root handler
func ApplyRoutes(senv *srvenv.Env, r *gin.Engine) {
	// https://flagbase.atlassian.net/browse/OSS-125
	// httpmetrics.ApplyMetrics(r, "api")
	root := r.Group("/")
	accesstransport.ApplyRoutes(senv, root)
	flagtransport.ApplyRoutes(senv, root)
	evaluationtransport.ApplyRoutes(senv, root)
	healthchecktransport.ApplyRoutes(senv, root)
	identitytransport.ApplyRoutes(senv, root)
	projecttransport.ApplyRoutes(senv, root)
	targetingtransport.ApplyRoutes(senv, root)
	traittransport.ApplyRoutes(senv, root)
	segmenttransport.ApplyRoutes(senv, root)
	workspacetransport.ApplyRoutes(senv, root)
}
