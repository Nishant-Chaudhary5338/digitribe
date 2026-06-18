'use client'

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="text-[#c4c1b8] hover:text-[#f0ede5] text-sm transition-colors duration-150 cursor-pointer"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-cookie-banner'))
      }}
    >
      Cookie preferences
    </button>
  )
}
