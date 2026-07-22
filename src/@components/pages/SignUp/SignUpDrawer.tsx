import Button from "@/@components/core/Button/Button";
import TermsCheckbox from "@/@components/core/Checkbox/TermsCehckbox";
import Drawer from "@/@components/core/Drawer/Drawer";
import Icon from "@/@components/core/Icon/Icon";
import Input from "@/@components/core/Input/Input";

interface ISignUpDrawer {
  isSignUpDrawer: boolean;
  setIsSignUpDrawer: (data: boolean) => void;
}

const SignUpDrawer: React.FC<ISignUpDrawer> = ({
  isSignUpDrawer,
  setIsSignUpDrawer,
}) => {
  return (
    <div>
      <Drawer
        isOpen={isSignUpDrawer}
        onClose={() => setIsSignUpDrawer(false)}
        className="xl:pl-4 xs:pl-3 py-5"
      >
        <Drawer.Header className="pr-2 flex items-center justify-between border-b pb-3 border-gray-200">
          <h3 className="text-lg font-bold">Sign Up</h3>
          <Icon
            onClick={() => setIsSignUpDrawer(false)}
            className="text-gray-600 hover:text-gray-800 cursor-pointer me-5"
            name={"close"}
          />
        </Drawer.Header>

        <Drawer.Body className="mt-2 mb-5 overflow-y-scroll">
          <form>
            <Input
              label="Username or email address"
              placeholder="Enter username or email"
              //   registerProperty={register("name")}
              //   errorText={errors?.name?.message}
              type="text"
              isRequired
              classNames="mb-10"
            />
            <Input
              label="Password"
              placeholder="Enter password"
              //   registerProperty={register("name")}
              //   errorText={errors?.name?.message}
              type="password"
              isRequired
              classNames="mb-10"
            />
            <Button className="w-full premium-cta mt-3">Log In</Button>
            <div className="flex items-center justify-between border-b pb-4 border-gray-200">
              <TermsCheckbox
                name="terms"
                label="Remember me"
                //   registerProperty={register("terms")}
                //   errorText={errors?.terms?.message}
                className="mt-4"
              />
              <p className="text-primary-dark mt-4 text-sm">Lost your password?</p>
            </div>
          </form>
          <div className="border-b pb-4 border-gray-200">
            <div className="flex mx-auto">
              <Icon
                name={"person"}
                size={70}
                variant="outlined"
                className="mx-auto flex text-gray-300"
              />
            </div>
            <p className="text-center font-bold text-gray-400 text-sm">
              No account yet?
            </p>
            <p className="text-center font-semibold text-gray-600 uppercase mt-3 decoration-primary-dark underline hover:cursor-pointer hover:text-primary-dark text-sm">
              create an account
            </p>
          </div>
        </Drawer.Body>

        {/* <Drawer.Footer className="flex items-end justify-end">
          <div></div>
        </Drawer.Footer> */}
      </Drawer>
    </div>
  );
};

export default SignUpDrawer;
