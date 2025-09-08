import SortSelect from './SortSelect';

interface HeaderSectionProps {
  selectedTag: string;
}

const HeaderSection = ({ selectedTag }: HeaderSectionProps) => {
  return (
    <div className="flex justify-between gap-4 whitespace-nowrap max-md:flex-col">
      <h1 className="text-3xl font-bold tracking-tight max-md:justify-start">
        {selectedTag === '전체' ? '전체 블로그 목록' : `"${selectedTag}"  관련 포스트`}
      </h1>
      <div className="flex justify-end gap-4 max-md:w-full">
        <SortSelect />
      </div>
    </div>
  );
};

export default HeaderSection;
