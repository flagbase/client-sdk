package service

import (
	"context"
	"core/internal/app/auth"
	segmentrulemodel "core/internal/app/segmentrule/model"
	segmentrulerepo "core/internal/app/segmentrule/repository"
	cons "core/internal/pkg/constants"
	rsc "core/internal/pkg/resource"
	"core/internal/pkg/srvenv"
	"core/pkg/patch"
	res "core/pkg/response"
)

type Service struct {
	Senv            *srvenv.Env
	SegmentRuleRepo *segmentrulerepo.Repo
}

func NewService(senv *srvenv.Env) *Service {
	return &Service{
		Senv:            senv,
		SegmentRuleRepo: segmentrulerepo.NewRepo(senv),
	}
}

// List returns a list of resource instances
// (*) atk: access_type <= service
func (s *Service) List(
	atk rsc.Token,
	a segmentrulemodel.RootArgs,
) (*[]segmentrulemodel.SegmentRule, *res.Errors) {
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := auth.Authorize(s.Senv, atk, rsc.AccessService); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	r, err := s.SegmentRuleRepo.List(ctx, a)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
	}

	return r, &e
}

// Create creates a new resource instance given the resource instance
// (*) atk: access_type <= user
func (s *Service) Create(
	atk rsc.Token,
	i segmentrulemodel.SegmentRule,
	a segmentrulemodel.RootArgs,
) (*segmentrulemodel.SegmentRule, *res.Errors) {
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := auth.Authorize(s.Senv, atk, rsc.AccessUser); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	r, err := s.SegmentRuleRepo.Create(ctx, i, a)
	if err != nil {
		e.Append(cons.ErrorInput, err.Error())
	}

	if e.IsEmpty() {
		if err := auth.AddPolicy(
			s.Senv,
			atk,
			r.ID,
			rsc.SegmentRule,
			rsc.AccessAdmin,
		); err != nil {
			e.Append(cons.ErrorAuth, err.Error())
		}
	}

	return r, &e
}

// Get gets a resource instance given an atk & key
// (*) atk: access_type <= service
func (s *Service) Get(
	atk rsc.Token,
	a segmentrulemodel.ResourceArgs,
) (*segmentrulemodel.SegmentRule, *res.Errors) {
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	r, err := s.SegmentRuleRepo.Get(ctx, a)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
	}

	// authorize operation
	if err := auth.Enforce(
		s.Senv,
		atk,
		r.ID,
		rsc.SegmentRule,
		rsc.AccessService,
	); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
	}

	return r, &e
}

// Update updates resource instance given an atk, key & patch object
// (*) atk: access_type <= user
func (s *Service) Update(
	atk rsc.Token,
	patchDoc patch.Patch,
	a segmentrulemodel.ResourceArgs,
) (*segmentrulemodel.SegmentRule, *res.Errors) {
	var o segmentrulemodel.SegmentRule
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	r, err := s.SegmentRuleRepo.Get(ctx, a)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
		cancel()
	}

	if err := auth.Enforce(
		s.Senv,
		atk,
		r.ID,
		rsc.SegmentRule,
		rsc.AccessUser,
	); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	if err := patch.Transform(r, patchDoc, &o); err != nil {
		e.Append(cons.ErrorInternal, err.Error())
		cancel()
	}

	r, err = s.SegmentRuleRepo.Update(ctx, o, a)
	if err != nil {
		e.Append(cons.ErrorInternal, err.Error())
	}

	return r, &e
}

// Delete deletes a resource instance given an atk & key
// (*) atk: access_type <= admin
func (s *Service) Delete(
	atk rsc.Token,
	a segmentrulemodel.ResourceArgs,
) *res.Errors {
	var e res.Errors
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	r, err := s.SegmentRuleRepo.Get(ctx, a)
	if err != nil {
		e.Append(cons.ErrorNotFound, err.Error())
		cancel()
	}

	// authorize operation
	if err := auth.Enforce(
		s.Senv,
		atk,
		r.ID,
		rsc.SegmentRule,
		rsc.AccessAdmin,
	); err != nil {
		e.Append(cons.ErrorAuth, err.Error())
		cancel()
	}

	if err := s.SegmentRuleRepo.Delete(ctx, a); err != nil {
		e.Append(cons.ErrorInternal, err.Error())
	}

	return &e
}