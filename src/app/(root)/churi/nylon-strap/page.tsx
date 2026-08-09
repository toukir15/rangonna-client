import Icon from "@/@components/core/Icon/Icon";

const page = async () => {
  return (
    <div className="max-w-layout mx-auto py-5 min-h-[47vh]">
      <div className="flex gap-6">
        {/* <FilterSideBar /> */}

        <div className="xl:w-4/5 w-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg">Home / Watches</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Icon name={"tune"} />
              <p className="text-lg">Filters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
