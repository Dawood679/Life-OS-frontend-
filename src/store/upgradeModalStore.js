import { create } from 'zustand';

export const useUpgradeModalStore = create((set) => ({
  isOpen: false,
  feature: 'general',
  title: 'Upgrade to LifeOS Pro',
  description: 'Supercharge your daily growth with unlimited AI intelligence, voice interactions, and verified career credentials.',

  openUpgradeModal: (feature = 'general', customTitle = '', customDescription = '') => {
    let title = customTitle;
    let description = customDescription;

    if (!title) {
      switch (feature) {
        case 'mock_interview':
          title = 'Unlock Unlimited AI Mock Interviews';
          description = 'Practice real-time technical & behavioral interviews with live voice synthesis, detailed radar feedback, and ideal answers.';
          break;
        case 'roadmap':
          title = 'Unlock Full 90-Day Career Blueprint';
          description = 'Generate multi-track career blueprints, schedule milestones directly to your daily agenda, and access Month 2 & 3 capstones.';
          break;
        case 'study_plan':
          title = 'Unlimited AI Study Plans & Micro-Quizzes';
          description = 'Accelerate skill acquisition with unlimited tailored curricula, active recall quizzes, and verifiable credential badges.';
          break;
        case 'smart_rescheduler':
          title = 'Activate AI Human Executive Assistant';
          description = 'Protect your health and consistency with automated deficit detection, 1-click batch snooze, and zero streak disruption.';
          break;
        case 'job_applications':
          title = 'Unlimited Job Application Pipeline';
          description = 'Track unlimited opportunities, unlock 16-column spreadsheet views, and auto-tailor interview prep for every role.';
          break;
        default:
          title = 'Upgrade to LifeOS Pro';
          description = 'Unlock the full power of the AI Life Operating System with unlimited access across Learning, Career, and Wellness.';
          break;
      }
    }

    set({
      isOpen: true,
      feature,
      title,
      description: description || 'Supercharge your growth with Pro.'
    });
  },

  closeUpgradeModal: () => set({ isOpen: false })
}));
