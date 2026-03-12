import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed, nextTick } from 'vue';

// Mock Ionic components as simple stubs
vi.mock('@ionic/vue', () => {
  const stub = (name: string, slots = true) => ({
    name,
    template: slots ? `<div class="${name}"><slot /></div>` : `<div class="${name}" />`,
    props: Object.keys({}),
  });
  return {
    IonPage: stub('ion-page'),
    IonHeader: stub('ion-header'),
    IonToolbar: stub('ion-toolbar'),
    IonTitle: { name: 'IonTitle', template: '<div class="ion-title"><slot /></div>' },
    IonContent: stub('ion-content'),
    IonList: stub('ion-list'),
    IonListHeader: stub('ion-list-header'),
    IonItem: { name: 'IonItem', template: '<div class="ion-item" @click="$emit(\'click\')"><slot /></div>', emits: ['click'], props: ['button', 'routerLink', 'detail'] },
    IonLabel: stub('ion-label'),
    IonNote: { name: 'IonNote', template: '<span class="ion-note"><slot /></span>', props: ['slot'] },
    IonButton: { name: 'IonButton', template: '<button class="ion-button" @click="$emit(\'click\')"><slot /></button>', emits: ['click'], props: ['expand', 'fill', 'color', 'size', 'disabled'] },
    IonIcon: { name: 'IonIcon', template: '<span class="ion-icon" />', props: ['icon', 'slot', 'color'] },
    IonInput: { name: 'IonInput', template: '<input />', props: ['modelValue', 'type', 'label', 'labelPlacement', 'inputmode', 'step', 'min', 'placeholder'] },
    IonSearchbar: { name: 'IonSearchbar', template: '<input class="ion-searchbar" />', props: ['modelValue', 'placeholder', 'debounce'], emits: ['ionInput'] },
    IonSegment: stub('ion-segment'),
    IonSegmentButton: stub('ion-segment-button'),
    IonCard: stub('ion-card'),
    IonCardContent: stub('ion-card-content'),
    IonCardHeader: stub('ion-card-header'),
    IonCardTitle: stub('ion-card-title'),
    IonToggle: { name: 'IonToggle', template: '<input type="checkbox" />', props: ['checked'], emits: ['ionChange'] },
    IonBadge: stub('ion-badge'),
    IonChip: stub('ion-chip'),
    IonInfiniteScroll: stub('ion-infinite-scroll'),
    IonInfiniteScrollContent: stub('ion-infinite-scroll-content', false),
    IonRefresher: stub('ion-refresher'),
    IonRefresherContent: stub('ion-refresher-content', false),
    IonFab: stub('ion-fab'),
    IonFabButton: stub('ion-fab-button'),
    IonSelect: { name: 'IonSelect', template: '<select />', props: ['modelValue', 'label', 'labelPlacement', 'interface'], emits: ['ionChange'] },
    IonSelectOption: { name: 'IonSelectOption', template: '<option />', props: ['value'] },
    IonTextarea: { name: 'IonTextarea', template: '<textarea />', props: ['modelValue', 'label', 'labelPlacement'] },
    IonDatetime: { name: 'IonDatetime', template: '<input type="date" />', props: ['modelValue', 'presentation'] },
    IonModal: stub('ion-modal'),
    IonGrid: stub('ion-grid'),
    IonRow: stub('ion-row'),
    IonCol: stub('ion-col'),
    IonProgressBar: { name: 'IonProgressBar', template: '<div />', props: ['type', 'value'] },
    IonBackButton: { name: 'IonBackButton', template: '<button />', props: ['defaultHref'] },
    IonButtons: stub('ion-buttons'),
    IonText: stub('ion-text'),
    IonTabs: stub('ion-tabs'),
    IonTabBar: stub('ion-tab-bar'),
    IonTabButton: stub('ion-tab-button'),
    IonRouterOutlet: stub('ion-router-outlet', false),
  };
});

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock API
vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ params: {}, query: {} }),
}));

// Mock ionicons
vi.mock('ionicons/icons', () => ({
  checkmarkCircle: 'checkmark-circle-stub',
  addOutline: 'add-outline-stub',
  trashOutline: 'trash-outline-stub',
  checkmarkCircleOutline: 'checkmark-circle-outline-stub',
  alertCircleOutline: 'alert-circle-outline-stub',
  closeOutline: 'close-outline-stub',
  settingsOutline: 'settings-outline-stub',
  walletOutline: 'wallet-outline-stub',
  homeOutline: 'home-outline-stub',
  listOutline: 'list-outline-stub',
  peopleOutline: 'people-outline-stub',
  statsChartOutline: 'stats-chart-outline-stub',
}));

// Mock notification service
vi.mock('@/services/pushNotifications', () => ({
  getNotificationPref: vi.fn().mockResolvedValue(true),
  setNotificationPref: vi.fn().mockResolvedValue(undefined),
}));

describe('Component Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('SettingsPage', () => {
    it('renders settings page with account section', async () => {
      // Mock auth store
      vi.mock('@/stores/auth', () => ({
        useAuthStore: () => ({
          user: { id: 1, name: 'Test User', email: 'test@test.com' },
          companies: [{ id: 1, name: 'Test Co' }],
          selectedCompanyId: 1,
          isAuthenticated: true,
          logout: vi.fn(),
          selectCompany: vi.fn(),
        }),
      }));

      const { default: SettingsPage } = await import('@/views/settings/SettingsPage.vue');
      const wrapper = mount(SettingsPage, {
        global: { plugins: [createPinia()] },
      });

      expect(wrapper.text()).toContain('Settings');
      expect(wrapper.text()).toContain('Account');
      expect(wrapper.text()).toContain('Notifications');
      expect(wrapper.text()).toContain('Sign Out');
    });
  });

  describe('MoneyInput', () => {
    it('renders with initial display value', async () => {
      const { default: MoneyInput } = await import('@/components/MoneyInput.vue');
      const wrapper = mount(MoneyInput, {
        props: {
          amountNum: 5000,
          amountDenom: 100,
          currencyCode: 'KES',
        },
      });
      expect(wrapper.find('.money-input').exists()).toBe(true);
      expect(wrapper.find('.currency-code').text()).toBe('KES');
    });
  });

  describe('OfflineBadge', () => {
    it('renders offline badge component', async () => {
      const { default: OfflineBadge } = await import('@/components/OfflineBadge.vue');
      const wrapper = mount(OfflineBadge, {
        global: { plugins: [createPinia()] },
      });
      expect(wrapper.exists()).toBe(true);
    });
  });
});
