package project

import (
	"context"
	cons "core/internal/constants"
	"core/internal/db"
	"core/internal/patch"
	rsc "core/internal/resource"
	res "core/internal/response"
	"core/pkg/auth"

	"github.com/lib/pq"
)

// List returns a list of resource instances
// (*) atk: access_type <= service
func List(
	atk rsc.Token,
	workspaceKey rsc.Key,
) (*res.Success, *res.Errors) {
	var o []Project
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// authorize operation
	if err := auth.Authorize(atk, rsc.AccessService); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	rows, err := db.Pool.Query(ctx, `
  SELECT
    p.id, p.key, p.name, p.description, p.tags
  FROM
    workspace w, project p
  WHERE
    w.key = $1 AND
    p.workspace_id = w.id
  `, workspaceKey)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
	}

	for rows.Next() {
		var _o Project
		if err = rows.Scan(
			&_o.ID,
			&_o.Key,
			&_o.Name,
			&_o.Description,
			&_o.Tags,
		); err != nil {
			e.Append(cons.ErrorNotFound, err.Error())
		}
		o = append(o, _o)
	}

	return &res.Success{Data: o}, &e
}

// Create creates a new resource instance given the resource instance
// (*) atk: access_type <= admin
func Create(
	atk rsc.Token,
	i Project,
	workspaceKey rsc.Key,
) (*res.Success, *res.Errors) {
	var o Project
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// authorize operation
	if err := auth.Authorize(atk, rsc.AccessAdmin); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	// create resource
	row := db.Pool.QueryRow(ctx, `
  INSERT INTO
    project(key, name, description, tags, workspace_id)
  VALUES
    ($1, $2, $3, $4, (
      SELECT id
      FROM workspace
      WHERE key = $5
    ))
  RETURNING
    id, key, name, description, tags;`,
		i.Key,
		i.Name,
		i.Description,
		pq.Array(i.Tags),
		workspaceKey,
	)
	if err := row.Scan(
		&o.ID,
		&o.Key,
		&o.Name,
		&o.Description,
		&o.Tags,
	); err != nil {
		e.Append(cons.ErrorInput, err.Error())
	}

	// Add policy for requesting user, after resource creation
	if e.IsEmpty() {
		err := auth.AddPolicy(atk, o.ID, rsc.Project, rsc.AccessAdmin)
		if err != nil {
			e.Append(cons.ErrorAuth, err.Error())
		}
	}

	return &res.Success{Data: o}, &e
}

// Get gets a resource instance given an atk & key
// (*) atk: access_type <= service
func Get(
	atk rsc.Token,
	workspaceKey rsc.Key,
	projectKey rsc.Key,
) (*res.Success, *res.Errors) {
	var e res.Errors

	r, err := getResource(workspaceKey, projectKey)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
	}

	// authorize operation
	if err := auth.Enforce(
		atk,
		r.ID,
		rsc.Project,
		rsc.AccessService,
	); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	return &res.Success{Data: r}, &e
}

// Update updates resource instance given an atk, key & patch object
// (*) atk: access_type <= user
func Update(
	atk rsc.Token,
	patchDoc patch.Patch,
	workspaceKey rsc.Key,
	projectKey rsc.Key,
) (*res.Success, *res.Errors) {
	var o Project
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// get original document
	r, err := getResource(workspaceKey, projectKey)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
		cancel()
	}

	// authorize operation
	if err := auth.Enforce(
		atk,
		r.ID,
		rsc.Project,
		rsc.AccessUser,
	); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	// apply patch and get modified document
	if err := patch.Transform(r, patchDoc, &o); err != nil {
		e.Append(cons.ErrorInternal, err.Error())
		cancel()
	}

	// update original with patched document
	if _, err := db.Pool.Exec(ctx, `
  UPDATE
    project
  SET
    key = $2, name = $3, description = $4, tags = $5
  WHERE
    id = $1`,
		r.ID.String(),
		o.Key,
		o.Name,
		o.Description,
		pq.Array(o.Tags),
	); err != nil && err != context.Canceled {
		e.Append(cons.ErrorInternal, err.Error())
	}

	return &res.Success{Data: o}, &e
}

// Delete deletes a resource instance given an atk & key
// (*) atk: access_type <= admin
func Delete(
	atk rsc.Token,
	workspaceKey rsc.Key,
	projectKey rsc.Key,
) *res.Errors {
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// get original document
	r, err := getResource(workspaceKey, projectKey)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
		cancel()
	}

	// authorize operation
	if err := auth.Enforce(
		atk,
		r.ID,
		rsc.Project,
		rsc.AccessAdmin,
	); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	if _, err := db.Pool.Exec(ctx, `
  DELETE FROM
    project
  WHERE
    workspace_id = (
      SELECT id
      FROM workspace
      WHERE key = $1
    ) AND key = $2
  `,
		workspaceKey,
		projectKey,
	); err != nil {
		e.Append(cons.ErrorInternal, err.Error())
	}

	return &e
}
