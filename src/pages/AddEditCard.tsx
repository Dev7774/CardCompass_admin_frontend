import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { getCardById, CreateManualCardRequest, Benefit, EarnMultiplier, AnnualSpendPerk } from '@/services/api/Cards/cardsApi';
import { useCreateManualCard, useUpdateCard } from '@/hooks/apiHooks/Cards/useCardMutations';
import { useToast } from '@/hooks/use-toast';
import { getCurrentOffer, updateOffer } from '@/services/api/Offers/offersApi';

const AddEditCard = () => {
  const { sidebarOpen } = useOutletContext<{ sidebarOpen: boolean }>();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const createManualCardMutation = useCreateManualCard();
  const updateCardMutation = useUpdateCard();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Basic Card Info
  const [cardKey, setCardKey] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardIssuer, setCardIssuer] = useState('');
  const [cardNetwork, setCardNetwork] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardUrl, setCardUrl] = useState('');
  const [annualFee, setAnnualFee] = useState('');
  const [creditRange, setCreditRange] = useState('');
  const [rewardsDescription, setRewardsDescription] = useState('');
  const [baseSpendEarnCategory, setBaseSpendEarnCategory] = useState('');
  const [introApr, setIntroApr] = useState('');
  const [regularApr, setRegularApr] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Status Flags
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [hasNoFxFee, setHasNoFxFee] = useState(false);
  const [hasLoungeAccess, setHasLoungeAccess] = useState(false);
  const [hasFreeNight, setHasFreeNight] = useState(false);
  const [hasFreeCheckedBag, setHasFreeCheckedBag] = useState(false);
  const [hasTrustedTravelerCredit, setHasTrustedTravelerCredit] = useState(false);

  // Multiple Values
  const [benefits, setBenefits] = useState<Benefit[]>([{ benefitTitle: '', benefitDesc: '' }]);
  const [earnMultipliers, setEarnMultipliers] = useState<EarnMultiplier[]>([{
    spendBonusCategoryName: '',
    earnMultiplier: null,
    spendBonusDesc: '',
  }]);
  const [annualSpendPerks, setAnnualSpendPerks] = useState<AnnualSpendPerk[]>([{ annualSpendDesc: '' }]);

  // Signup Bonus Fields (for current offer)
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const [signupBonusDescription, setSignupBonusDescription] = useState('');
  const [signupBonusAmount, setSignupBonusAmount] = useState('');
  const [signupBonusType, setSignupBonusType] = useState('');
  const [signupBonusSpend, setSignupBonusSpend] = useState('');
  const [signupBonusLength, setSignupBonusLength] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      loadCardData();
    }
  }, [id, isEditMode]);

  const loadCardData = async () => {
    setLoading(true);
    try {
      const response = await getCardById(id!);
      if (response.success && response.data) {
        const card = response.data as any;
        setCardKey(card.apiCardId || card.cardKey || '');
        setCardName(card.name || card.cardName || '');
        setCardIssuer(card.issuer || card.cardIssuer || '');
        setCardNetwork(card.network || card.cardNetwork || '');
        setCardType(card.cardType || '');
        setCardUrl(card.cardUrl || '');
        setAnnualFee(card.annualFee?.toString() || '');
        setCreditRange(card.creditScore || card.creditRange || '');
        setRewardsDescription(card.rewards || card.rewardsDescription || '');
        setBaseSpendEarnCategory(card.baseSpendEarnCategory || '');
        setIntroApr(card.introApr || '');
        setRegularApr(card.regularApr || card.purchaseAPR || '');
        setInternalNotes(card.internalNotes || '');
        setActive(card.active !== undefined ? card.active : (card.isActive !== undefined ? card.isActive : true));
        setFeatured(card.featured !== undefined ? card.featured : (card.isFeatured !== undefined ? card.isFeatured : false));
        setHasNoFxFee(card.hasNoFxFee || false);
        setHasLoungeAccess(card.hasLoungeAccess || false);
        setHasFreeNight(card.hasFreeNight || false);
        setHasFreeCheckedBag(card.hasFreeCheckedBag || false);
        setHasTrustedTravelerCredit(card.hasTrustedTravelerCredit || false);
        
        // Load benefits
        if (card.benefits && Array.isArray(card.benefits) && card.benefits.length > 0) {
          setBenefits(card.benefits.map((b: any) => ({
            benefitTitle: b.benefitTitle || '',
            benefitDesc: b.benefitDesc || '',
          })));
        } else {
          setBenefits([{ benefitTitle: '', benefitDesc: '' }]);
        }
        
        // Load earn multipliers
        if (card.earnMultipliers && Array.isArray(card.earnMultipliers) && card.earnMultipliers.length > 0) {
          setEarnMultipliers(card.earnMultipliers.map((m: any) => ({
            spendBonusCategoryGroup: m.spendBonusCategoryGroup || '',
            spendBonusSubcategoryGroup: m.spendBonusSubcategoryGroup || '',
            spendBonusCategoryName: m.spendBonusCategoryName || '',
            earnMultiplier: m.earnMultiplier || null,
            spendBonusDesc: m.spendBonusDesc || '',
            isDateLimit: m.isDateLimit || false,
            limitBeginDate: m.limitBeginDate || null,
            limitEndDate: m.limitEndDate || null,
            isSpendLimit: m.isSpendLimit || false,
            spendLimit: m.spendLimit || null,
            spendLimitResetPeriod: m.spendLimitResetPeriod || null,
          })));
        } else {
          setEarnMultipliers([{
            spendBonusCategoryName: '',
            earnMultiplier: null,
            spendBonusDesc: '',
          }]);
        }
        
        // Load annual spend perks
        if (card.annualSpendPerks && Array.isArray(card.annualSpendPerks) && card.annualSpendPerks.length > 0) {
          setAnnualSpendPerks(card.annualSpendPerks.map((p: any) => ({
            annualSpendDesc: p.annualSpendDesc || '',
          })));
        } else {
          setAnnualSpendPerks([{ annualSpendDesc: '' }]);
        }

        // Load current offer if editing
        if (isEditMode && id) {
          try {
            const offerResponse = await getCurrentOffer(id);
            if (offerResponse.success && offerResponse.data) {
              const offer = offerResponse.data as any;
              setCurrentOfferId(offer.id);
              setSignupBonusDescription(offer.signUpBonus || offer.signupBonusDescription || offer.signupBonusDesc || '');
              setSignupBonusAmount(offer.signupBonusAmount || '');
              setSignupBonusType(offer.signupBonusType || offer.signupBonusItem || '');
              setSignupBonusSpend(offer.signupBonusSpend?.toString() || offer.minimumSpend?.toString() || '');
              setSignupBonusLength(offer.signupBonusLength?.toString() || '');
            }
          } catch (offerError: any) {
            // No current offer found, that's okay
            if (offerError.message !== 'No current offer found') {
              console.log('Error loading current offer:', offerError);
            }
          }
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load card data',
        variant: 'destructive',
      });
      console.error('Failed to load card data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBenefit = () => {
    setBenefits([...benefits, { benefitTitle: '', benefitDesc: '' }]);
  };

  const handleRemoveBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index));
    }
  };

  const handleBenefitChange = (index: number, field: 'benefitTitle' | 'benefitDesc', value: string) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: value };
    setBenefits(updated);
  };

  const handleAddEarnMultiplier = () => {
    setEarnMultipliers([...earnMultipliers, {
      spendBonusCategoryName: '',
      earnMultiplier: null,
      spendBonusDesc: '',
    }]);
  };

  const handleRemoveEarnMultiplier = (index: number) => {
    if (earnMultipliers.length > 1) {
      setEarnMultipliers(earnMultipliers.filter((_, i) => i !== index));
    }
  };

  const handleEarnMultiplierChange = (index: number, field: string, value: any) => {
    const updated = [...earnMultipliers];
    updated[index] = { ...updated[index], [field]: value };
    setEarnMultipliers(updated);
  };

  const handleAddAnnualSpendPerk = () => {
    setAnnualSpendPerks([...annualSpendPerks, { annualSpendDesc: '' }]);
  };

  const handleRemoveAnnualSpendPerk = (index: number) => {
    if (annualSpendPerks.length > 1) {
      setAnnualSpendPerks(annualSpendPerks.filter((_, i) => i !== index));
    }
  };

  const handleAnnualSpendPerkChange = (index: number, value: string) => {
    const updated = [...annualSpendPerks];
    updated[index] = { annualSpendDesc: value };
    setAnnualSpendPerks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardName.trim() || !cardIssuer.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Card name and issuer are required',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && id) {
        // Update existing card
        const updateData = {
          cardName: cardName.trim(),
          cardIssuer: cardIssuer.trim(),
          cardNetwork: cardNetwork.trim() || null,
          cardType: cardType.trim() || null,
          cardUrl: cardUrl.trim() || null,
          annualFee: annualFee ? parseFloat(annualFee) : null,
          creditRange: creditRange.trim() || null,
          rewardsDescription: rewardsDescription.trim() || null,
          baseSpendEarnCategory: baseSpendEarnCategory.trim() || null,
          introApr: introApr.trim() || null,
          regularApr: regularApr.trim() || null,
          active,
          featured,
          internalNotes: internalNotes.trim() || null,
          hasNoFxFee,
          hasLoungeAccess,
          hasFreeNight,
          hasFreeCheckedBag,
          hasTrustedTravelerCredit,
          benefits: benefits.filter(b => b.benefitTitle.trim() !== ''),
          earnMultipliers: earnMultipliers.filter(m => m.earnMultiplier || m.spendBonusCategoryName?.trim()),
          annualSpendPerks: annualSpendPerks.filter(p => p.annualSpendDesc.trim() !== ''),
        };

        await updateCardMutation.mutateAsync({ id, data: updateData });

        // Update current offer if it exists and fields are provided
        if (currentOfferId && (signupBonusDescription || signupBonusAmount || signupBonusType || signupBonusSpend || signupBonusLength)) {
          try {
            await updateOffer(currentOfferId, {
              signupBonusDesc: signupBonusDescription || undefined,
              signUpBonus: signupBonusDescription || undefined,
              signupBonusAmount: signupBonusAmount || undefined,
              signupBonusType: signupBonusType || undefined,
              signupBonusSpend: signupBonusSpend ? parseFloat(signupBonusSpend) : undefined,
              signupBonusLength: signupBonusLength ? parseInt(signupBonusLength) : undefined,
            });
          } catch (offerError: any) {
            console.error('Failed to update offer:', offerError);
            // Don't fail the whole save if offer update fails
          }
        }
      } else {
        // Create new card
        const cardData: CreateManualCardRequest = {
          cardKey: cardKey.trim() || undefined,
          cardName: cardName.trim(),
          cardIssuer: cardIssuer.trim(),
          cardNetwork: cardNetwork.trim() || null,
          cardType: cardType.trim() || null,
          cardUrl: cardUrl.trim() || null,
          annualFee: annualFee ? parseFloat(annualFee) : null,
          creditRange: creditRange.trim() || null,
          rewardsDescription: rewardsDescription.trim() || null,
          baseSpendEarnCategory: baseSpendEarnCategory.trim() || null,
          introApr: introApr.trim() || null,
          regularApr: regularApr.trim() || null,
          active,
          featured,
          internalNotes: internalNotes.trim() || null,
          hasNoFxFee,
          hasLoungeAccess,
          hasFreeNight,
          hasFreeCheckedBag,
          hasTrustedTravelerCredit,
          benefits: benefits.filter(b => b.benefitTitle.trim() !== ''),
          earnMultipliers: earnMultipliers.filter(m => m.earnMultiplier || m.spendBonusCategoryName?.trim()),
          annualSpendPerks: annualSpendPerks.filter(p => p.annualSpendDesc.trim() !== ''),
        };

        await createManualCardMutation.mutateAsync(cardData);
      }
      navigate('/cards');
    } catch (error: any) {
      // Error is handled by the mutation hook
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="grow bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grow bg-gray-50 dark:bg-gray-900">
      <div className={`mx-auto w-full px-4 pb-8 sm:px-6 lg:px-8 ${sidebarOpen ? 'pt-6' : 'pt-4'}`}>
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/cards')}
            className="flex items-center w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Card' : 'Add New Card'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isEditMode ? 'Update card information' : 'Create a new credit card manually'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Card Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardName" className="text-gray-700 dark:text-gray-300">Card Name *</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cardIssuer" className="text-gray-700 dark:text-gray-300">Card Issuer *</Label>
                <Input
                  id="cardIssuer"
                  value={cardIssuer}
                  onChange={(e) => setCardIssuer(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cardKey" className="text-gray-700 dark:text-gray-300">Card Key</Label>
                <Input
                  id="cardKey"
                  value={cardKey}
                  onChange={(e) => setCardKey(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cardNetwork" className="text-gray-700 dark:text-gray-300">Card Network</Label>
                <Input
                  id="cardNetwork"
                  value={cardNetwork}
                  onChange={(e) => setCardNetwork(e.target.value)}
                  placeholder="Visa, Mastercard, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cardType" className="text-gray-700 dark:text-gray-300">Card Type</Label>
                <Input
                  id="cardType"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  placeholder="Personal, Business, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cardUrl" className="text-gray-700 dark:text-gray-300">Card URL</Label>
                <Input
                  id="cardUrl"
                  type="url"
                  value={cardUrl}
                  onChange={(e) => setCardUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="annualFee" className="text-gray-700 dark:text-gray-300">Annual Fee</Label>
                <Input
                  id="annualFee"
                  type="number"
                  step="0.01"
                  value={annualFee}
                  onChange={(e) => setAnnualFee(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="creditRange" className="text-gray-700 dark:text-gray-300">Credit Range</Label>
                <Input
                  id="creditRange"
                  value={creditRange}
                  onChange={(e) => setCreditRange(e.target.value)}
                  placeholder="e.g., 700-850"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="baseSpendEarnCategory" className="text-gray-700 dark:text-gray-300">Base Spend Earn Category</Label>
                <Input
                  id="baseSpendEarnCategory"
                  value={baseSpendEarnCategory}
                  onChange={(e) => setBaseSpendEarnCategory(e.target.value)}
                  placeholder="e.g., Dining, Travel"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="introApr" className="text-gray-700 dark:text-gray-300">Intro APR</Label>
                <Input
                  id="introApr"
                  value={introApr}
                  onChange={(e) => setIntroApr(e.target.value)}
                  placeholder="e.g., 0% for 15 months"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="regularApr" className="text-gray-700 dark:text-gray-300">Regular APR</Label>
                <Input
                  id="regularApr"
                  value={regularApr}
                  onChange={(e) => setRegularApr(e.target.value)}
                  placeholder="e.g., 15.99% - 22.99%"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="rewardsDescription" className="text-gray-700 dark:text-gray-300">Rewards Description</Label>
                <textarea
                  id="rewardsDescription"
                  value={rewardsDescription}
                  onChange={(e) => setRewardsDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="internalNotes" className="text-gray-700 dark:text-gray-300">Internal Notes</Label>
                <textarea
                  id="internalNotes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Status Flags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Status & Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Active</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Featured</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNoFxFee}
                  onChange={(e) => setHasNoFxFee(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">No FX Fee</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLoungeAccess}
                  onChange={(e) => setHasLoungeAccess(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Lounge Access</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFreeNight}
                  onChange={(e) => setHasFreeNight(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Free Night</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFreeCheckedBag}
                  onChange={(e) => setHasFreeCheckedBag(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Free Checked Bag</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTrustedTravelerCredit}
                  onChange={(e) => setHasTrustedTravelerCredit(e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Trusted Traveler Credit</span>
              </label>
            </div>
          </div>

          {/* Signup Bonus Fields (Current Offer) */}
          {isEditMode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Offer - Signup Bonus</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signupBonusDescription" className="text-gray-700 dark:text-gray-300">Sign-Up Bonus Description</Label>
                  <Input
                    id="signupBonusDescription"
                    value={signupBonusDescription}
                    onChange={(e) => setSignupBonusDescription(e.target.value)}
                    placeholder="e.g., 80,000 bonus points"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signupBonusAmount" className="text-gray-700 dark:text-gray-300">Sign-Up Bonus Amount</Label>
                    <Input
                      id="signupBonusAmount"
                      value={signupBonusAmount}
                      onChange={(e) => setSignupBonusAmount(e.target.value)}
                      placeholder="e.g., 80000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupBonusType" className="text-gray-700 dark:text-gray-300">Sign-Up Bonus Type/Item</Label>
                    <Input
                      id="signupBonusType"
                      value={signupBonusType}
                      onChange={(e) => setSignupBonusType(e.target.value)}
                      placeholder="e.g., Points, Miles"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signupBonusSpend" className="text-gray-700 dark:text-gray-300">Sign-Up Bonus Spend</Label>
                    <Input
                      id="signupBonusSpend"
                      type="number"
                      step="0.01"
                      value={signupBonusSpend}
                      onChange={(e) => setSignupBonusSpend(e.target.value)}
                      placeholder="e.g., 4000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signupBonusLength" className="text-gray-700 dark:text-gray-300">Sign-Up Bonus Length</Label>
                    <Input
                      id="signupBonusLength"
                      type="number"
                      value={signupBonusLength}
                      onChange={(e) => setSignupBonusLength(e.target.value)}
                      placeholder="e.g., 90"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Other Offers*/}
          {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Other Offers</h2>
              <Button type="button" onClick={handleAddEarnMultiplier} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Multiplier
              </Button>
            </div>
            <div className="space-y-4">
              {earnMultipliers.map((multiplier, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-end mb-2">
                    {earnMultipliers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEarnMultiplier(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={multiplier.spendBonusCategoryName || ''}
                        onChange={(e) => handleEarnMultiplierChange(index, 'spendBonusCategoryName', e.target.value)}
                        placeholder="e.g., Dining, Travel"
                      />
                    </div>
                    <div>
                      <Label>Earn Multiplier</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={multiplier.earnMultiplier || ''}
                        onChange={(e) => handleEarnMultiplierChange(index, 'earnMultiplier', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="e.g., 3 for 3X"
                      />
                    </div>
                    <div>
                      <Label>Category Group</Label>
                      <Input
                        value={multiplier.spendBonusCategoryGroup || ''}
                        onChange={(e) => handleEarnMultiplierChange(index, 'spendBonusCategoryGroup', e.target.value)}
                        placeholder="Category group"
                      />
                    </div>
                    <div>
                      <Label>Subcategory Group</Label>
                      <Input
                        value={multiplier.spendBonusSubcategoryGroup || ''}
                        onChange={(e) => handleEarnMultiplierChange(index, 'spendBonusSubcategoryGroup', e.target.value)}
                        placeholder="Subcategory group"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <textarea
                        value={multiplier.spendBonusDesc || ''}
                        onChange={(e) => handleEarnMultiplierChange(index, 'spendBonusDesc', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Bonus description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Benefits</h2>
              <Button type="button" onClick={handleAddBenefit} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Benefit
              </Button>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Benefit Title"
                      value={benefit.benefitTitle}
                      onChange={(e) => handleBenefitChange(index, 'benefitTitle', e.target.value)}
                    />
                    <Input
                      placeholder="Benefit Description (optional)"
                      value={benefit.benefitDesc || ''}
                      onChange={(e) => handleBenefitChange(index, 'benefitDesc', e.target.value)}
                    />
                  </div>
                  {benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBenefit(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>


          {/* Annual Spend Perks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Annual Spend Perks</h2>
              <Button type="button" onClick={handleAddAnnualSpendPerk} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Perk
              </Button>
            </div>
            <div className="space-y-4">
              {annualSpendPerks.map((perk, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Annual spend perk description"
                    value={perk.annualSpendDesc}
                    onChange={(e) => handleAnnualSpendPerkChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {annualSpendPerks.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAnnualSpendPerk(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cards')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditMode ? 'Update Card' : 'Create Card'
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddEditCard;

