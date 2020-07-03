package workspace

// Workspace represents a collection of projects
type Workspace struct {
	ID          string   `json:"id"`
	Key         string   `json:"key"`
	Name        string   `json:"name,omitempty"`
	Description string   `json:"description,omitempty"`
	Tags        []string `json:"tags,omitempty"`
}
