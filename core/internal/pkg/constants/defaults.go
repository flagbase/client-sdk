package constants

import (
	"time"
)

var (
	// DefaultDBURL the default postgres database connection string
	DefaultDBURL string = "postgres://flagbase:BjrvWmjQ3dykPu@" +
		"db:5432/flagbase" +
		"?sslmode=disable"
	// DefaultHTTPPort default http server port
	DefaultHTTPPort int = 5051
	// DefaultStreamerPort default streamer server port
	DefaultStreamerPort int = 7051
  // DefaultVerbose should log verbosely by default
	DefaultVerbose bool = false
	// DefaultRootKey default root access key
	DefaultRootKey string = "root"
	// DefaultRootSecret default root access secret
	DefaultRootSecret string = "toor"
	// MaxUnixTime The maxiumum unix time
	// TODO: come up with better method in year 2038
	MaxUnixTime int64 = 9223372036854775807
	// JWTKey used to encode jwt
	JWTKey string = "bad_secret"
	// JWTExpiryMinutes default JWT lifetime (in minutes)
	JWTExpiryMinutes time.Duration = 5000
	// DefaultPrometheus for if prometheus is setup
	DefaultPrometheus bool = false
)
