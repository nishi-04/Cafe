import React, { useState } from 'react';
import { Check, ArrowRight, Plus } from 'lucide-react';
import {
  CustomerMember,
  RewardOption,
  BonusChallenge,
  REWARD_OPTIONS,
  BONUS_CHALLENGES,
  getMemberTier,
} from '../data/roasteryData';

interface LoyaltySectionProps {
  members: CustomerMember[];
  activeMember: CustomerMember;
  onSelectMember: (memberId: string) => void;
  onCreateMember: (name: string, email: string) => void;
  selectedRewardId: string | null;
  onSelectRewardForCart: (reward: RewardOption | null) => void;
  onCompleteBonusChallenge: (challenge: BonusChallenge, inputVal: string) => void;
  onOpenCart: () => void;
}

export const LoyaltySection: React.FC<LoyaltySectionProps> = ({
  members,
  activeMember,
  onSelectMember,
  onCreateMember,
  selectedRewardId,
  onSelectRewardForCart,
  onCompleteBonusChallenge,
  onOpenCart,
}) => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'earn' | 'ledger'>('rewards');
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [challengeInputs, setChallengeInputs] = useState<Record<string, string>>({});
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const tier = getMemberTier(activeMember.lifetimePoints);

  const nextThreshold = tier.nextTierThreshold || 1200;
  const progressPercent = tier.nextTierThreshold
    ? Math.min(100, Math.round((activeMember.lifetimePoints / nextThreshold) * 100))
    : 100;

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    onCreateMember(newName.trim(), newEmail.trim());
    setNewName('');
    setNewEmail('');
    setShowNewMemberForm(false);
  };

  const handleChallengeSubmit = (challenge: BonusChallenge) => {
    const val = (challengeInputs[challenge.id] || challenge.defaultInputPlaceholder).trim();
    onCompleteBonusChallenge(challenge, val);
    setChallengeFeedback(
      `Credited +${challenge.pointsReward} pts to ${activeMember.name}'s balance.`
    );
    setTimeout(() => setChallengeFeedback(null), 4000);
  };

  return (
    <section
      id="rewards-ledger"
      className="py-16 sm:py-20 border-t border-zinc-200/80 bg-[#F1F3F5]/60"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Member Account Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-200/80">
          <div>
            <div className="text-xs text-zinc-500">
              <span>02. Vespera Apothecary Society</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Member Point Ledger & Tier Redemptions</span>
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-zinc-950 mt-1 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Track Roast Points & Redeem Apothecary Credits
            </h2>
          </div>

          {/* Interactive Member Switcher for Testing & Enrolling */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="member-switcher" className="text-xs text-zinc-500 mr-1">
              Active Member:
            </label>
            <select
              id="member-switcher"
              value={activeMember.id}
              onChange={(e) => onSelectMember(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-2 focus:outline-[#14532D]"
            >
              {members.map((m) => {
                const mTier = getMemberTier(m.lifetimePoints);
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} — {mTier.shortName} ({m.pointsBalance} pts)
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={() => setShowNewMemberForm((prev) => !prev)}
              className="px-3 py-2 text-xs font-medium border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {showNewMemberForm ? 'Cancel Enrollment' : '+ Enroll New Member (+150 pts)'}
            </button>
          </div>
        </div>

        {/* Optional New Member Enrollment Bar */}
        {showNewMemberForm && (
          <form
            onSubmit={handleEnrollSubmit}
            className="mt-6 p-5 bg-white border border-zinc-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g.,Julian Mercer"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-2 focus:outline-[#14532D]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="julian@studio-mercer.com"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-2 focus:outline-[#14532D]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#14532D] hover:bg-[#0f3f22] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Create Account & Claim 150 Pts
            </button>
          </form>
        )}

        {/* Member Status Overview Architecture (Single-Elevation Card) */}
        <div className="mt-8 bg-white border border-zinc-200/80 rounded-xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 5 cols: Balance & Tier Identity */}
            <div className="lg:col-span-5 lg:border-r border-zinc-200/80 lg:pr-8">
              <div className="text-xs text-zinc-500">
                <span>{activeMember.name}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Member since {activeMember.memberSince}</span>
              </div>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono tabular-nums text-4xl sm:text-5xl font-semibold text-zinc-950 tracking-tight">
                  {activeMember.pointsBalance.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-[#14532D]">
                  Redeemable Points
                </span>
              </div>

              <div className="mt-2 text-xs text-zinc-600">
                <span>Current Standing: </span>
                <strong className="font-semibold text-zinc-900">{tier.name}</strong>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {tier.pointsPerDollar} pts / $1
                </span>
              </div>

              {/* Tier Progress Bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-zinc-600 mb-1.5">
                  <span className="font-mono tabular-nums">
                    Lifetime: {activeMember.lifetimePoints.toLocaleString()} pts
                  </span>
                  {tier.nextTierThreshold ? (
                    <span className="font-mono tabular-nums">
                      {tier.nextTierThreshold - activeMember.lifetimePoints} pts to{' '}
                      {tier.nextTierName}
                    </span>
                  ) : (
                    <span className="text-[#14532D] font-medium">
                      Highest Tier Unlocked (10 pts / $1)
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#14532D] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono tabular-nums mt-1.5">
                  <span>Bronze (0)</span>
                  <span>Silver (500)</span>
                  <span>Gold (1,200+)</span>
                </div>
              </div>
            </div>

            {/* Right 7 cols: Active Tier Benefits & Applied Voucher State */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-zinc-900">
                  {tier.name} Privileges
                </h3>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs text-zinc-600">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className="text-[#14532D] font-bold leading-4">·</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-zinc-600">
                  {selectedRewardId ? (
                    <span>
                      Active Checkout Voucher:{' '}
                      <strong className="text-[#14532D]">
                        {REWARD_OPTIONS.find((r) => r.id === selectedRewardId)?.title}
                      </strong>{' '}
                      staged for your bag.
                    </span>
                  ) : (
                    <span>
                      Select any reward voucher below to stage an instant discount in your shopping bag.
                    </span>
                  )}
                </div>
                {selectedRewardId && (
                  <button
                    type="button"
                    onClick={onOpenCart}
                    className="px-4 py-2 bg-[#14532D] text-white text-xs font-medium rounded-lg hover:bg-[#0f3f22] transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    <span>View Discount in Bag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Filter Tabs for Rewards Catalog, Earn Bonus Points, and Ledger */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setActiveTab('rewards')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'rewards'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Redeem Vouchers ({REWARD_OPTIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('earn')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'earn'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Earn Bonus Points (+235 pts)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Points Activity Ledger ({activeMember.transactions.length})
            </button>
          </div>

          {challengeFeedback && (
            <div className="text-xs font-medium text-[#14532D]">
              {challengeFeedback}
            </div>
          )}
        </div>

        {/* TAB 1: Redeem Vouchers Grid */}
        {activeTab === 'rewards' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REWARD_OPTIONS.map((reward) => {
              const isSelected = selectedRewardId === reward.id;
              const canAfford = activeMember.pointsBalance >= reward.pointsCost;
              const pointsShort = Math.max(0, reward.pointsCost - activeMember.pointsBalance);

              return (
                <div
                  key={reward.id}
                  className={`bg-white rounded-xl p-6 border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-[#14532D] ring-1 ring-[#14532D]'
                      : 'border-zinc-200/80'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono tabular-nums text-zinc-500">
                      <span>{reward.pointsCost.toLocaleString()} PTS</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="text-[#14532D] font-medium">
                        -${reward.discountAmount.toFixed(2)} USD
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold text-zinc-950 mt-2">
                      {reward.title}
                    </h3>

                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                      {reward.description}
                    </p>

                    <div className="mt-3 text-[11px] font-mono tabular-nums text-zinc-400">
                      Min. order subtotal: ${reward.minOrderAmount.toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100">
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={() => onSelectRewardForCart(null)}
                        className="w-full py-2 px-4 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied to Bag (Remove)</span>
                      </button>
                    ) : canAfford ? (
                      <button
                        type="button"
                        onClick={() => onSelectRewardForCart(reward)}
                        className="w-full py-2 px-4 rounded-lg bg-[#14532D] text-white text-xs font-medium hover:bg-[#0f3f22] transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Redeem & Apply (-${reward.discountAmount.toFixed(2)})
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 px-4 rounded-lg bg-zinc-100 text-zinc-400 text-xs font-mono tabular-nums cursor-not-allowed whitespace-nowrap"
                      >
                        Need {pointsShort} more pts
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Earn Bonus Points */}
        {activeTab === 'earn' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {BONUS_CHALLENGES.map((challenge) => {
              const isCompleted = activeMember.completedBonusIds.includes(challenge.id);
              return (
                <div
                  key={challenge.id}
                  className="bg-white rounded-xl p-6 border border-zinc-200/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono tabular-nums text-[#14532D] font-medium">
                      +{challenge.pointsReward} PTS BONUS
                    </div>
                    <h3 className="font-display text-xl font-semibold text-zinc-950 mt-1.5">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-100">
                    {isCompleted ? (
                      <div className="py-2 px-3 bg-zinc-50 rounded-lg text-xs text-[#14532D] font-medium flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Completed & Credited (+{challenge.pointsReward} pts)</span>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          value={challengeInputs[challenge.id] ?? ''}
                          onChange={(e) =>
                            setChallengeInputs((prev) => ({
                              ...prev,
                              [challenge.id]: e.target.value,
                            }))
                          }
                          placeholder={challenge.defaultInputPlaceholder}
                          aria-label={challenge.verificationPrompt}
                          className="w-full px-3 py-2 text-xs font-mono border border-zinc-200 rounded-lg bg-zinc-50 focus:bg-white focus:outline-2 focus:outline-[#14532D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleChallengeSubmit(challenge)}
                          className="w-full py-2 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Verify & Credit +{challenge.pointsReward} Pts</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Points Activity Ledger (Tabular Numerals Discipline) */}
        {activeTab === 'ledger' && (
          <div className="mt-6 bg-white rounded-xl border border-zinc-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200/80 text-xs text-zinc-500 bg-zinc-50/70">
                    <th className="py-3.5 px-6 font-medium">Date</th>
                    <th className="py-3.5 px-6 font-medium">Reference</th>
                    <th className="py-3.5 px-6 font-medium">Activity Description</th>
                    <th className="py-3.5 px-6 font-medium text-right">Points Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 text-sm">
                  {activeMember.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-mono tabular-nums text-xs text-zinc-500 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-6 font-mono tabular-nums text-xs text-zinc-800 whitespace-nowrap">
                        {tx.reference}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-zinc-700">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3.5 px-6 font-mono tabular-nums text-xs font-semibold text-right whitespace-nowrap ${
                          tx.pointsDelta >= 0 ? 'text-[#14532D]' : 'text-zinc-900'
                        }`}
                      >
                        {tx.pointsDelta >= 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
