import { Question, Language } from './types';

export const getRiskQuestions = (lang: Language): Question[] => {
  if (lang === 'zh-TW') {
    return [
      {
        id: 'q1',
        text: '您此投資組合的主要目標是什麼？',
        options: [
          { label: '資本保值 (我不能承受任何虧損)', value: 'conservative' },
          { label: '穩定收益並伴隨部分成長', value: 'moderate' },
          { label: '長期資本成長', value: 'growth' },
          { label: '最大化資本增值 (投機)', value: 'aggressive' },
        ],
      },
      {
        id: 'q2',
        text: '您的投資時間範圍是多久？',
        options: [
          { label: '少於 3 年', value: 'short' },
          { label: '3-7 年', value: 'medium' },
          { label: '7-15 年', value: 'long' },
          { label: '15 年以上', value: 'very_long' },
        ],
      },
      {
        id: 'q3',
        text: '如果您的投資組合在一個月內下跌 20%，您會怎麼做？',
        options: [
          { label: '立即全部賣出以防止進一步虧損', value: 'panic' },
          { label: '賣出部分資產以減少曝險', value: 'nervous' },
          { label: '什麼都不做，等待回升', value: 'hold' },
          { label: '加碼買進 (視為特價)', value: 'buy' },
        ],
      },
      {
        id: 'q4',
        text: '您如何描述目前的財務穩定性？',
        options: [
          { label: '收入不穩定，無緊急預備金', value: 'unstable' },
          { label: '收入穩定，有少量儲蓄', value: 'stable' },
          { label: '高收入，有大量儲蓄', value: 'wealthy' },
        ],
      },
      {
        id: 'q5',
        text: '您的投資經驗如何？',
        options: [
          { label: '無經驗 / 初學者', value: 'novice' },
          { label: '有一些經驗 (共同基金/ETF)', value: 'intermediate' },
          { label: '活躍交易者 / 專家', value: 'expert' },
        ],
      }
    ];
  }
  
  return [
    {
      id: 'q1',
      text: 'What is your primary goal for this investment portfolio?',
      options: [
        { label: 'Capital Preservation (I cannot afford to lose money)', value: 'conservative' },
        { label: 'Steady Income with some growth', value: 'moderate' },
        { label: 'Long-term Growth', value: 'growth' },
        { label: 'Maximum Capital Appreciation (Speculation)', value: 'aggressive' },
      ],
    },
    {
      id: 'q2',
      text: 'What is your investment time horizon?',
      options: [
        { label: 'Less than 3 years', value: 'short' },
        { label: '3-7 years', value: 'medium' },
        { label: '7-15 years', value: 'long' },
        { label: '15+ years', value: 'very_long' },
      ],
    },
    {
      id: 'q3',
      text: 'If your portfolio dropped 20% in a single month, what would you do?',
      options: [
        { label: 'Sell everything immediately to prevent further loss', value: 'panic' },
        { label: 'Sell some assets to reduce exposure', value: 'nervous' },
        { label: 'Do nothing, wait for recovery', value: 'hold' },
        { label: 'Buy more (View it as a discount)', value: 'buy' },
      ],
    },
    {
      id: 'q4',
      text: 'How would you describe your current financial stability?',
      options: [
        { label: 'Unstable income, no emergency fund', value: 'unstable' },
        { label: 'Stable income, small savings', value: 'stable' },
        { label: 'High income, significant savings', value: 'wealthy' },
      ],
    },
    {
      id: 'q5',
      text: 'What is your experience with investing?',
      options: [
        { label: 'None / Beginner', value: 'novice' },
        { label: 'Some experience (Mutual Funds/ETFs)', value: 'intermediate' },
        { label: 'Active Trader / Expert', value: 'expert' },
      ],
    }
  ];
};

export const INITIAL_AGENTS = [
  { id: 'risk', name: 'Risk Analysis Agent', status: 'idle', message: 'Waiting...' },
  { id: 'market', name: 'Market Data Agent', status: 'idle', message: 'Standing by...' },
  { id: 'portfolio', name: 'Portfolio Design Agent', status: 'idle', message: 'Waiting...' },
  { id: 'simulation', name: 'Simulation Agent', status: 'idle', message: 'Waiting...' },
  { id: 'report', name: 'Report Agent', status: 'idle', message: 'Waiting...' },
] as const;