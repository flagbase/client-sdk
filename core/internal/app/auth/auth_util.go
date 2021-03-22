package auth

import (
	"core/internal/app/access"
	rsc "core/internal/pkg/resource"
	"core/pkg/jwt"
	"encoding/json"
)

// getAccessFromToken retrieves access from access token (atk)
func getAccessFromToken(atk rsc.Token) (*access.Access, error) {
	var a access.Access

	ma, err := jwt.Verify(atk)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(ma, &a); err != nil {
		return nil, err
	}

	return &a, nil
}
