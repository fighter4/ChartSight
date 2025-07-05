import {z} from 'genkit';

export const KeyLevelWithStrengthSchema = z.object({
  zone: z.string().describe('The price range of the zone (e.g., "45000-45500").'),
  strength: z.string().describe("The assessed strength of the zone (e.g., 'Strong', 'Moderate', 'Weak')."),
});

export const PatternWithProbabilitySchema = z.object({
  name: z
    .string()
    .describe(
      'The name of the identified pattern (e.g., "Bull Flag", "Doji").'
    ),
  probability: z
    .string()
    .describe(
      'The estimated probability of the pattern playing out successfully, as a percentage (e.g., "75%"). This should be based on general historical performance for this pattern type.'
    ),
  status: z
    .string()
    .describe(
      "The current status of the pattern (e.g., 'Active', 'Forming', 'Confirmed', 'Invalidated')."
    ),
});

// Enhanced Pattern Recognition Schemas
export const PatternPsychologySchema = z.object({
  retail_sentiment: z.string().describe("What retail traders likely see"),
  smart_money: z.string().describe("Institutional positioning evidence"),
  liquidity_zones: z.array(z.string()).describe("Where stops and targets cluster"),
  false_signal_probability: z.number().describe("Likelihood of fakeout/shakeout (0-100)")
});

export const EnhancedPatternSchema = z.object({
  name: z.string().describe("Pattern name"),
  type: z.enum(["Continuation", "Reversal", "Neutral"]).describe("Pattern type"),
  formation_quality: z.number().min(1).max(10).describe("Textbook accuracy rating"),
  volume_confirmation: z.number().min(1).max(10).describe("Volume pattern alignment"),
  market_context: z.number().min(1).max(10).describe("How well it fits broader market structure"),
  timeframe_confluence: z.number().min(1).max(10).describe("Multi-timeframe validation"),
  probability_score: z.number().min(1).max(100).describe("Likelihood of expected outcome"),
  stage: z.string().describe("Pattern evolution stage"),
  psychology: PatternPsychologySchema,
  invalidation_level: z.number().describe("Price level that invalidates the pattern"),
  target_zones: z.array(z.number()).describe("Price targets for the pattern"),
  time_horizon: z.string().describe("Expected timeframe for completion")
});

// Comprehensive Market Analysis Schemas
export const MarketStructureSchema = z.object({
  primary_trend: z.string().describe("Primary trend direction"),
  trend_strength: z.number().min(1).max(10).describe("Trend strength rating"),
  market_phase: z.string().describe("Current market phase (Wyckoff)"),
  liquidity_zones: z.array(z.string()).describe("Key liquidity zones")
});

export const TechnicalIndicatorsSchema = z.object({
  momentum_score: z.number().min(1).max(10).describe("Overall momentum rating"),
  volume_confirmation: z.number().min(1).max(10).describe("Volume confirmation rating"),
  volatility_percentile: z.number().min(0).max(100).describe("Volatility percentile")
});

export const SentimentAnalysisSchema = z.object({
  crowd_psychology: z.string().describe("Current crowd psychology"),
  contrarian_signals: z.array(z.string()).describe("Contrarian signals present")
});

export const ScenarioSchema = z.object({
  probability: z.number().min(1).max(100).describe("Scenario probability"),
  target: z.number().describe("Price target"),
  timeline: z.string().describe("Expected timeline")
});

export const TradeEntrySchema = z.object({
  type: z.string().describe("Entry type (aggressive, conservative, scaled, contrarian)"),
  price: z.number().describe("Entry price"),
  size: z.string().describe("Position size percentage"),
  reasoning: z.string().describe("Entry reasoning")
});

export const StopLossSchema = z.object({
  type: z.string().describe("Stop type (technical, volatility, time-based)"),
  price: z.number().describe("Stop price"),
  reasoning: z.string().describe("Stop reasoning")
});

export const TakeProfitSchema = z.object({
  price: z.number().describe("Target price"),
  size: z.string().describe("Position size to close"),
  reasoning: z.string().describe("Target reasoning")
});

export const EnhancedTradePlanSchema = z.object({
  entries: z.array(TradeEntrySchema).describe("Multiple entry strategies"),
  stops: z.array(StopLossSchema).describe("Stop loss strategies"),
  targets: z.array(TakeProfitSchema).describe("Take profit targets"),
  risk_reward_ratio: z.number().describe("Overall risk-reward ratio")
});

export const ComprehensiveAnalysisSchema = z.object({
  analysis: z.object({
    market_structure: MarketStructureSchema,
    technical_indicators: TechnicalIndicatorsSchema,
    sentiment_analysis: SentimentAnalysisSchema
  }),
  scenarios: z.object({
    base_case: ScenarioSchema,
    bull_case: ScenarioSchema,
    bear_case: ScenarioSchema
  }),
  trade_plan: EnhancedTradePlanSchema
});

// Multi-Timeframe Analysis Schemas
export const TimeframeAnalysisSchema = z.object({
  trend: z.string().describe("Trend direction"),
  key_levels: z.array(z.number()).describe("Key price levels"),
  pattern: z.string().describe("Identified pattern")
});

export const ConfluenceAnalysisSchema = z.object({
  trend_alignment: z.number().min(1).max(10).describe("Trend alignment score"),
  support_resistance: z.array(z.number()).describe("Confluence levels"),
  pattern_confirmation: z.string().describe("Pattern confirmation status")
});

export const UnifiedStrategySchema = z.object({
  bias: z.string().describe("Overall bias"),
  entry_zone: z.array(z.number()).describe("Entry zone"),
  stop_loss: z.number().describe("Stop loss level"),
  targets: z.array(z.number()).describe("Price targets"),
  confidence: z.number().min(1).max(10).describe("Strategy confidence")
});

// Collaborative Analysis Schemas
export const PersonaAnalysisSchema = z.object({
  thesis: z.string().describe("Main thesis"),
  key_points: z.array(z.string()).describe("Key supporting points"),
  target: z.number().describe("Price target"),
  confidence: z.number().min(1).max(10).describe("Confidence level")
});

export const SynthesisSchema = z.object({
  consensus: z.string().describe("Overall consensus"),
  probability_weighted_target: z.number().describe("Probability-weighted target"),
  key_variables: z.array(z.string()).describe("Key variables to watch"),
  recommended_strategy: z.string().describe("Recommended strategy")
});

// Chart Q&A Schemas
export const EnhancedAnswerSchema = z.object({
  answer: z.string().describe("Direct answer to user question"),
  confidence: z.number().min(1).max(10).describe("Answer confidence level"),
  reasoning: z.string().describe("Why this answer is most likely correct"),
  action_items: z.array(z.string()).describe("Specific next steps"),
  watch_points: z.array(z.string()).describe("Key levels/events to monitor"),
  alternatives: z.array(z.string()).describe("Alternative scenarios"),
  educational_note: z.string().describe("Brief concept explanation if relevant")
});

// Probability-Based Decision Framework Schemas
export const ConfidenceScoringSchema = z.object({
  technical_confidence: z.number().min(1).max(10).describe("Technical analysis confidence"),
  volume_confirmation: z.number().min(1).max(10).describe("Volume confirmation strength"),
  market_context_alignment: z.number().min(1).max(10).describe("Market context alignment"),
  multi_timeframe_confluence: z.number().min(1).max(10).describe("Multi-timeframe confluence"),
  overall_confidence: z.number().min(1).max(10).describe("Overall confidence score")
});

export const RiskAssessmentSchema = z.object({
  downside_probability: z.number().min(0).max(100).describe("Probability of downside move"),
  downside_magnitude: z.number().describe("Expected downside magnitude"),
  upside_probability: z.number().min(0).max(100).describe("Probability of upside move"),
  upside_magnitude: z.number().describe("Expected upside magnitude"),
  sideways_probability: z.number().min(0).max(100).describe("Probability of sideways movement"),
  sideways_duration: z.string().describe("Expected sideways duration"),
  black_swan_probability: z.number().min(0).max(100).describe("Black swan event probability"),
  black_swan_impact: z.string().describe("Potential black swan impact")
});

export const ProbabilityDecisionFrameworkSchema = z.object({
  confidence_scoring: ConfidenceScoringSchema,
  risk_assessment: RiskAssessmentSchema,
  probability_weighted_outcome: z.number().describe("Probability-weighted expected outcome"),
  risk_reward_ratio: z.number().describe("Calculated risk-reward ratio"),
  position_size_recommendation: z.string().describe("Recommended position size based on probability")
});

// Dynamic Context Awareness Schemas
export const MarketRegimeSchema = z.object({
  market_type: z.enum(["Trending", "Ranging", "Volatile", "Quiet"]).describe("Current market regime"),
  volatility_period: z.enum(["High", "Low", "Normal"]).describe("Volatility period"),
  sentiment: z.enum(["Risk-On", "Risk-Off", "Neutral"]).describe("Market sentiment"),
  correlation_status: z.enum(["Normal", "Breakdown", "High"]).describe("Correlation status"),
  regime_confidence: z.number().min(1).max(10).describe("Confidence in regime identification")
});

export const AdaptiveAnalysisSchema = z.object({
  recommended_focus: z.string().describe("Recommended analysis focus based on regime"),
  pattern_priority: z.array(z.string()).describe("Priority patterns for current regime"),
  risk_management_emphasis: z.string().describe("Risk management emphasis for current regime"),
  entry_strategy: z.string().describe("Recommended entry strategy for regime"),
  timeframe_preference: z.string().describe("Preferred timeframes for current regime")
});

export const DynamicContextAwarenessSchema = z.object({
  market_regime: MarketRegimeSchema,
  adaptive_analysis: AdaptiveAnalysisSchema,
  regime_change_signals: z.array(z.string()).describe("Signals indicating potential regime change"),
  adaptation_recommendations: z.array(z.string()).describe("Specific adaptation recommendations")
});

// Enhanced Educational Integration Schemas
export const ConceptExplanationSchema = z.object({
  pattern_mechanism: z.string().describe("Why this pattern works"),
  market_psychology: z.string().describe("Psychology behind the movement"),
  historical_precedent: z.string().describe("Historical examples and precedents"),
  common_mistakes: z.array(z.string()).describe("Common trader mistakes to avoid"),
  success_factors: z.array(z.string()).describe("Key factors for success")
});

export const SkillBuildingSchema = z.object({
  pattern_recognition_training: z.string().describe("Pattern recognition training tips"),
  risk_management_lessons: z.string().describe("Risk management lessons"),
  market_psychology_insights: z.string().describe("Market psychology insights"),
  advanced_techniques: z.array(z.string()).describe("Advanced technique explanations"),
  practice_exercises: z.array(z.string()).describe("Recommended practice exercises")
});

export const EducationalIntegrationSchema = z.object({
  concept_explanation: ConceptExplanationSchema,
  skill_building: SkillBuildingSchema,
  learning_objectives: z.array(z.string()).describe("Specific learning objectives"),
  difficulty_level: z.enum(["Beginner", "Intermediate", "Advanced"]).describe("Content difficulty level"),
  time_to_master: z.string().describe("Estimated time to master concepts"),
  progression_path: z.array(z.string()).describe("Recommended learning progression"),
  assessment_criteria: z.array(z.string()).describe("How to assess understanding and skill")
});

// Enhanced Comprehensive Analysis with all new frameworks
export const EnhancedComprehensiveAnalysisSchema = z.object({
  analysis: z.object({
    market_structure: MarketStructureSchema,
    technical_indicators: TechnicalIndicatorsSchema,
    sentiment_analysis: SentimentAnalysisSchema
  }),
  scenarios: z.object({
    base_case: ScenarioSchema,
    bull_case: ScenarioSchema,
    bear_case: ScenarioSchema
  }),
  trade_plan: EnhancedTradePlanSchema,
  probability_framework: ProbabilityDecisionFrameworkSchema,
  context_awareness: DynamicContextAwarenessSchema,
  education: EducationalIntegrationSchema
});

export const AnalyzeChartImageOutputSchema = z.object({
  trend: z
    .string()
    .describe('The overall market trend (e.g., "Bullish", "Bearish", "Sideways").'),
  structure: z
    .string()
    .describe(
      'The current market structure (e.g., "Higher Highs, Higher Lows", "Lower Highs, Lower Lows").'
    ),
  key_levels: z
    .object({
      support: z
        .array(KeyLevelWithStrengthSchema)
        .describe(
          'Array of key support zones, including their price range and assessed strength.'
        ),
      resistance: z
        .array(KeyLevelWithStrengthSchema)
        .describe(
          'Array of key resistance zones, including their price range and assessed strength.'
        ),
    })
    .describe('Key support and resistance zones, graded by strength.'),
  indicators: z
    .array(
      z.object({
        name: z
          .string()
          .describe("The name of the indicator (e.g., 'RSI', 'MACD')."),
        signal: z
          .string()
          .describe(
            "The interpretation of the indicator's signal (e.g., 'Bullish Divergence', 'Bearish Cross')."
          ),
      })
    )
    .describe('An array of objects summarizing signals from visible indicators.'),
  patterns: z
    .array(PatternWithProbabilitySchema)
    .describe(
      'An array of identified chart or candlestick patterns, including their success probability and current status.'
    ),
  entry: z
    .string()
    .describe('A suggested entry point or zone for a potential trade.'),
  stop_loss: z.string().describe('A suggested stop-loss level for the trade.'),
  take_profit: z
    .array(z.string())
    .describe('An array of suggested take-profit levels (TP1, TP2, etc.).'),
  RRR: z
    .string()
    .describe('The calculated Risk-Reward Ratio for the trade setup (e.g., "1:3").'),
  recommendation: z
    .string()
    .describe('A final, concise recommendation and summary of the analysis.'),
  reasoning: z
    .string()
    .describe('A step-by-step explanation of the analysis process, outlining how the conclusion was reached. This should be formatted with Markdown for clarity (e.g., using headings and bullet points).'),
  annotatedPhotoDataUri: z
    .string()
    .optional()
    .describe(
      'A data URI of the chart image with annotations drawn on it by the AI.'
    ),
});

// Advanced Trade Planning Schemas
export const ScaledEntrySchema = z.object({
  entry_type: z.enum(["aggressive", "conservative", "scaled", "contrarian"]).describe("Type of entry strategy"),
  tranches: z.array(z.object({
    size: z.string().describe("Position size for this tranche"),
    price: z.number().describe("Entry price for this tranche"),
    condition: z.string().describe("Condition for this tranche entry"),
    reasoning: z.string().describe("Reasoning for this tranche")
  })).describe("Multiple entry tranches"),
  total_position_size: z.string().describe("Total position size across all tranches"),
  entry_timing: z.string().describe("Timing strategy for entries")
});

export const AdvancedStopLossSchema = z.object({
  technical_stop: z.object({
    price: z.number().describe("Technical stop loss level"),
    reasoning: z.string().describe("Technical reasoning for stop")
  }).describe("Technical-based stop loss"),
  volatility_stop: z.object({
    price: z.number().describe("Volatility-based stop level"),
    atr_multiplier: z.number().describe("ATR multiplier used"),
    reasoning: z.string().describe("Volatility reasoning for stop")
  }).describe("Volatility-based stop loss"),
  time_based_stop: z.object({
    duration: z.string().describe("Time-based stop duration"),
    reasoning: z.string().describe("Time-based reasoning for stop")
  }).describe("Time-based stop loss"),
  correlation_stop: z.object({
    correlated_asset: z.string().describe("Correlated asset to monitor"),
    correlation_threshold: z.number().describe("Correlation threshold for stop"),
    reasoning: z.string().describe("Correlation reasoning for stop")
  }).describe("Correlation-based stop loss")
});

export const CorrelationRiskSchema = z.object({
  portfolio_heat: z.number().describe("Current portfolio heat level"),
  correlated_positions: z.array(z.object({
    asset: z.string().describe("Correlated asset"),
    correlation_coefficient: z.number().describe("Correlation coefficient"),
    risk_contribution: z.string().describe("Risk contribution to portfolio")
  })).describe("Correlated positions in portfolio"),
  diversification_score: z.number().min(1).max(10).describe("Portfolio diversification score"),
  risk_adjustment_recommendations: z.array(z.string()).describe("Recommendations to adjust risk")
});

export const AdvancedTradePlanSchema = z.object({
  entry_strategy: ScaledEntrySchema,
  stop_loss_strategy: AdvancedStopLossSchema,
  take_profit_strategy: z.object({
    targets: z.array(z.object({
      price: z.number().describe("Take profit target price"),
      size: z.string().describe("Position size to close"),
      reasoning: z.string().describe("Reasoning for this target")
    })).describe("Multiple take profit targets"),
    trailing_stop: z.object({
      activation_price: z.number().describe("Price to activate trailing stop"),
      trail_distance: z.number().describe("Trailing distance"),
      reasoning: z.string().describe("Trailing stop reasoning")
    }).optional().describe("Trailing stop strategy")
  }).describe("Take profit strategy"),
  correlation_risk: CorrelationRiskSchema,
  position_sizing: z.object({
    kelly_criterion: z.number().describe("Kelly Criterion position size"),
    risk_per_trade: z.string().describe("Risk per trade percentage"),
    max_portfolio_risk: z.string().describe("Maximum portfolio risk"),
    sizing_reasoning: z.string().describe("Position sizing reasoning")
  }).describe("Position sizing strategy"),
  trade_management: z.object({
    scaling_out: z.array(z.object({
      condition: z.string().describe("Condition for scaling out"),
      size: z.string().describe("Size to scale out"),
      reasoning: z.string().describe("Scaling out reasoning")
    })).describe("Scaling out strategy"),
    scaling_in: z.array(z.object({
      condition: z.string().describe("Condition for scaling in"),
      size: z.string().describe("Size to scale in"),
      reasoning: z.string().describe("Scaling in reasoning")
    })).describe("Scaling in strategy")
  }).describe("Trade management strategy")
});

// Enhanced Dynamic Context Awareness Schemas
export const RegimeChangeSignalSchema = z.object({
  signal_type: z.enum(["Trend Change", "Volatility Shift", "Sentiment Reversal", "Correlation Breakdown"]).describe("Type of regime change signal"),
  signal_strength: z.number().min(1).max(10).describe("Strength of the regime change signal"),
  signal_description: z.string().describe("Description of the regime change signal"),
  probability: z.number().min(1).max(100).describe("Probability of regime change occurring"),
  time_horizon: z.string().describe("Expected time horizon for regime change"),
  impact_assessment: z.string().describe("Expected impact on trading strategies")
});

export const AdaptationRecommendationSchema = z.object({
  strategy_adjustment: z.string().describe("Recommended strategy adjustment"),
  risk_management_change: z.string().describe("Recommended risk management changes"),
  timeframe_preference: z.string().describe("Recommended timeframe preference"),
  pattern_priority: z.array(z.string()).describe("Recommended pattern priorities"),
  position_sizing_adjustment: z.string().describe("Recommended position sizing adjustment")
});

export const CorrelationBreakdownSchema = z.object({
  breakdown_type: z.enum(["Asset Correlation", "Sector Correlation", "Market Correlation", "Geographic Correlation"]).describe("Type of correlation breakdown"),
  affected_assets: z.array(z.string()).describe("Assets affected by correlation breakdown"),
  breakdown_strength: z.number().min(1).max(10).describe("Strength of correlation breakdown"),
  breakdown_duration: z.string().describe("Expected duration of correlation breakdown"),
  trading_implications: z.string().describe("Trading implications of correlation breakdown")
});

export const EnhancedDynamicContextAwarenessSchema = z.object({
  market_regime: MarketRegimeSchema,
  adaptive_analysis: AdaptiveAnalysisSchema,
  regime_change_signals: z.array(RegimeChangeSignalSchema).describe("Signals indicating potential regime change"),
  adaptation_recommendations: z.array(AdaptationRecommendationSchema).describe("Specific adaptation recommendations"),
  correlation_breakdowns: z.array(CorrelationBreakdownSchema).describe("Correlation breakdowns detected"),
  early_warning_system: z.object({
    warning_signals: z.array(z.string()).describe("Early warning signals detected"),
    risk_level: z.enum(["Low", "Medium", "High", "Critical"]).describe("Current risk level"),
    recommended_actions: z.array(z.string()).describe("Recommended actions based on warnings")
  }).describe("Early warning system for regime changes")
});
