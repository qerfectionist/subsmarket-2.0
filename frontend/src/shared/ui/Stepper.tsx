import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface Step {
    title: string;
    description?: string;
}

export interface StepperProps {
    steps: Step[];
    currentStep: number; // 0-indexed
    className?: string;
    onStepClick?: (index: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
    steps,
    currentStep,
    className,
    onStepClick
}) => {
    return (
        <div className={cn("w-full", className)}>
            <div className="relative flex items-center justify-between">
                {/* Connecting Line background */}
                <div className="absolute top-4 left-0 right-0 h-[2px] bg-[var(--color-bg-tertiary)] -z-10" />

                {/* Active Line Progress */}
                <div 
                    className="absolute top-4 left-0 h-[2px] bg-[var(--color-button)] -z-10 transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex flex-col items-center",
                                onStepClick && index <= currentStep ? "cursor-pointer" : ""
                            )}
                            onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                    isActive 
                                        ? "border-[var(--color-button)] text-[var(--color-button)] bg-[var(--color-bg-primary)] scale-110" 
                                        : isCompleted 
                                            ? "border-[var(--color-button)] bg-[var(--color-button)] text-white" 
                                            : "border-[var(--color-separator)] bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
                                )}
                            >
                                {isCompleted ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    index + 1
                                )}
                            </div>

                            <div className="mt-2 text-center hidden sm:block">
                                <p className={cn(
                                    "text-xs font-medium transition-colors",
                                    isActive || isCompleted ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
                                )}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
