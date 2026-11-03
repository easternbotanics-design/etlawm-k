import { Fragment } from "react";
import { colours, fonts } from "../../theme/theme";

function CheckoutSteps({ steps, activeStep, onStepChange }) {
  const activeIndex = steps.findIndex((step) => step.key === activeStep);

  return (
    <div className="mx-auto mb-4 max-w-xl">
      <div className="flex items-start justify-center">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          const isClickable = !step.disabled;

          return (
            <Fragment key={step.key}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onStepChange(step.key)}
                className="flex w-24 flex-col items-center disabled:cursor-not-allowed"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-all"
                  style={{
                    borderColor:
                      isActive || isCompleted
                        ? colours.text
                        : colours.border,
                    backgroundColor:
                      isActive || isCompleted
                        ? colours.text
                        : colours.background,
                    color:
                      isActive || isCompleted
                        ? colours.background
                        : colours.text,
                    fontFamily: fonts.secondary,
                    opacity: step.disabled ? 0.35 : 1,
                  }}
                >
                  {index + 1}
                </span>

                <span
                  className="mt-1.5 text-center text-xs font-medium"
                  style={{
                    color: colours.text,
                    fontFamily: fonts.secondary,
                    opacity: isActive || isCompleted ? 1 : 0.45,
                  }}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className="mt-[11px] h-px w-10 sm:w-16"
                  style={{
                    backgroundColor:
                      index < activeIndex ? colours.text : colours.border,
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default CheckoutSteps;