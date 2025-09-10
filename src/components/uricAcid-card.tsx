import { BiomarkerCard } from '@/components/biomarker-card';
import { UricAcidChart } from './uricAcid-chart';
import { AddUricAcidRecordDialog } from './add-uricAcid-record-dialog';
import { LucideDroplet } from 'lucide-react';

const UricAcidCard: React.FC = () => {
  const { uricAcidRecords, addUricAcidRecord } = useApp();

  const getStatus = (value: number): string => {
    // Placeholder logic
    return 'Normal';
  };

  const formatRecord = (record: { value: number; date: string }): string => {
    return `${record.value} mg/dl`;
  };

  return (
    <BiomarkerCard
      title="Uric Acid"
      icon={<LucideDroplet />}
      unit="mg/dl"
      records={uricAcidRecords}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddUricAcidRecordDialog addRecord={addUricAcidRecord} />}
      chart={<UricAcidChart records={uricAcidRecords} />}
    />
  );
};

export default UricAcidCard;