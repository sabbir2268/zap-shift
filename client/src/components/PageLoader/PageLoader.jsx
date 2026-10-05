/*
 * The one spinner the project shows while it is waiting on something.
 *
 * Left to itself it fills the screen and sits dead centre, which is what the
 * route guards want while the session and the role are still being read, so a
 * refresh no longer leaves the circle in the corner of an empty page. Inside a
 * page, pass className to fill the area the loader is standing in for and the
 * spinner lands in the middle of that area instead of under the heading.
 */
const PageLoader = ({ className = "min-h-screen" }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`flex w-full items-center justify-center ${className}`}
  >
    <span className="loading loading-spinner loading-xl text-[var(--foreground)]"></span>
  </div>
);

export default PageLoader;