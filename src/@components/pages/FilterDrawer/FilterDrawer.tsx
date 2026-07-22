import Drawer from "@/@components/core/Drawer/Drawer";
import Icon from "@/@components/core/Icon/Icon";
import FilterSideBar from "../FilterSidebar/FilterSideBar";

interface ISignUpDrawer {
  isFilterDrawer: boolean;
  setIsFilterDrawer: (data: boolean) => void;
  minPrice: any;
  maxPrice: any;
  setMinPrice: any;
  setMaxPrice: any;
  sort: any;
  setSort: any;
  brands: any;
  setBrands: any;
  categories: any;
  setCategories: any;
  filterCategories?: string;
  filterBrand?: string;
  clearPrice?: any;
  priceClear?: boolean;
}

const FilterDrawer: React.FC<ISignUpDrawer> = ({
  isFilterDrawer,
  setIsFilterDrawer,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  sort,
  setSort,
  brands,
  setBrands,
  categories,
  setCategories,
  filterCategories = "",
  priceClear,
  filterBrand,
}) => {
  return (
    <div>
      <Drawer
        isOpen={isFilterDrawer}
        onClose={() => setIsFilterDrawer(false)}
        className="xl:pl-4 xs:pl-3 py-5"
      >
        <Drawer.Header className="pr-2 flex items-center justify-between border-b pb-3 border-gray-200">
          <h3 className="text-lg font-bold">Filter</h3>
          <Icon
            onClick={() => setIsFilterDrawer(false)}
            className="text-gray-600 hover:text-gray-800 cursor-pointer me-5"
            name={"close"}
          />
        </Drawer.Header>

        <Drawer.Body className="mt-2 mb-5 overflow-y-scroll">
          <FilterSideBar
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            sort={sort}
            setSort={setSort}
            brands={brands}
            setBrands={setBrands}
            categories={categories}
            setCategories={setCategories}
            filterCategories={filterCategories}
            priceClear={priceClear}
            filterBrand={filterBrand}
          />
        </Drawer.Body>

        {/* <Drawer.Footer className="flex items-end justify-end">
          <div></div>
        </Drawer.Footer> */}
      </Drawer>
    </div>
  );
};

export default FilterDrawer;
