package model

import rsc "core/internal/pkg/resource"

// ResourceArgs arguments for selecting specific resource
type ResourceArgs struct {
	WorkspaceKey rsc.Key
	ProjectKey   rsc.Key
	FlagKey      rsc.Key
}