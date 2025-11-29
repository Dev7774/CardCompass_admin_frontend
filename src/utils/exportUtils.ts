import { Card } from '@/services/api/Cards/cardsApi';
import { Offer } from '@/services/api/Offers/offersApi';

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] ?? '';
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export cards to CSV
 */
export async function exportCardsToCSV(cards: Card[]): Promise<void> {
  const headers = [
    'Name',
    'Issuer',
    'Network',
    'Annual Fee',
    'Card Type',
    'Credit Range',
    'Active',
    'Featured',
    'Sign Up Bonus',
    'Referral URL',
    'Card URL',
    'Created At',
    'Updated At',
  ];
  
  const csvData = cards.map(card => ({
    'Name': card.name || '',
    'Issuer': card.issuer || '',
    'Network': card.network || '',
    'Annual Fee': card.annualFee?.toString() || '',
    'Card Type': card.cardType || '',
    'Credit Range': card.creditRange || '',
    'Active': card.active ? 'Yes' : 'No',
    'Featured': card.featured ? 'Yes' : 'No',
    'Sign Up Bonus': card.currentOffer?.signUpBonus || '',
    'Referral URL': card.currentOffer?.referralUrl || '',
    'Card URL': card.cardUrl || '',
    'Created At': new Date(card.createdAt).toLocaleString(),
    'Updated At': new Date(card.updatedAt).toLocaleString(),
  }));
  
  const csv = convertToCSV(csvData, headers);
  const filename = `cards_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Export offers to CSV
 */
export async function exportOffersToCSV(offers: Offer[]): Promise<void> {
  const headers = [
    'Card Name',
    'Internal Label',
    'Sign Up Bonus',
    'Sign Up Bonus Amount',
    'Sign Up Bonus Type',
    'Sign Up Bonus Spend',
    'Sign Up Bonus Length',
    'Minimum Spend',
    'Time Period',
    'Start Date',
    'End Date',
    'Referral URL',
    'Public URL',
    'Current',
    'Visible',
    'Archived',
    'Created At',
    'Updated At',
  ];
  
  const csvData = offers.map(offer => ({
    'Card Name': offer.card?.name || '',
    'Internal Label': offer.internalLabel || '',
    'Sign Up Bonus': offer.signUpBonus || '',
    'Sign Up Bonus Amount': offer.signupBonusAmount || '',
    'Sign Up Bonus Type': offer.signupBonusType || '',
    'Sign Up Bonus Spend': offer.signupBonusSpend?.toString() || '',
    'Sign Up Bonus Length': offer.signupBonusLength?.toString() || '',
    'Minimum Spend': offer.minimumSpend?.toString() || '',
    'Time Period': offer.timePeriod || '',
    'Start Date': offer.startDate ? new Date(offer.startDate).toLocaleDateString() : '',
    'End Date': offer.endDate ? new Date(offer.endDate).toLocaleDateString() : '',
    'Referral URL': offer.referralUrl || '',
    'Public URL': offer.publicUrl || '',
    'Current': offer.isCurrent ? 'Yes' : 'No',
    'Visible': offer.visible ? 'Yes' : 'No',
    'Archived': offer.archived ? 'Yes' : 'No',
    'Created At': new Date(offer.createdAt).toLocaleString(),
    'Updated At': new Date(offer.updatedAt).toLocaleString(),
  }));
  
  const csv = convertToCSV(csvData, headers);
  const filename = `offers_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

