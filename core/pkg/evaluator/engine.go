package evaluator

import (
	"core/pkg/model"
	"errors"
)

// Evaluate the variation for a single flag
func Evaluate(
	flag model.Flag,
	salt string,
	ectx model.Context,
) *model.Evaluation {
	o := &model.Evaluation{
		FlagKey: flag.FlagKey,
	}

	if len(flag.Rules) > 0 && !flag.UseFallthrough {
		eval := evaluateRules(flag.Rules, salt, ectx)
		o.Reason = eval.Reason
		o.VariationKey = eval.VariationKey
	}

	if o.VariationKey == "" {
		o.Reason = model.ReasonFallthrough
		if len(flag.FallthroughVariations) > 1 {
			o.Reason = model.ReasonFallthroughWeighted
		}
		o.VariationKey = deriveVariation(
			salt,
			flag.FallthroughVariations,
		)
	}

	return o
}

func evaluateRules(
	rules []model.Rule,
	salt string,
	ectx model.Context,
) model.Evaluation {
	var o model.Evaluation
	variationVotes := make(map[string]int)

	maxVotes := 0
	for _, r := range rules {
		eval, err := evaluateRule(r, salt, ectx)
		if err == nil {
			if _, ok := variationVotes[eval.VariationKey]; !ok {
				variationVotes[eval.VariationKey] = 0
			}
			variationVotes[eval.VariationKey]++
			if variationVotes[eval.VariationKey] > maxVotes {
				maxVotes = variationVotes[eval.VariationKey]
				o = eval
			}
		}
	}

	return o
}

func evaluateRule(
	rule model.Rule,
	salt string,
	ectx model.Context,
) (model.Evaluation, error) {
	var o model.Evaluation

	if _, ok := ectx.Traits[rule.TraitKey]; !ok {
		return o, errors.New("rule trait not present in context")
	}

	matches := Matcher[rule.Operator](
		ectx.Traits[rule.TraitKey],
		rule.TraitValue,
	)
	if rule.Negate {
		matches = !matches
	}

	if !matches {
		return o, errors.New("rule does not match")
	}

	o.Reason = model.ReasonTargeted
	if len(rule.RuleVariations) > 1 {
		o.Reason = model.ReasonTargetedWeighted
	}
	o.VariationKey = deriveVariation(
		salt,
		rule.RuleVariations,
	)
	return o, nil
}
