export default function HomePage() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 32 }}>
      <h1>EUROSTRY Backend</h1>
      <p>Next.js API service for authentication, properties, and inquiries.</p>
      <ul>
        <li>`/api/health`</li>
        <li>`/api/auth/register`</li>
        <li>`/api/auth/login`</li>
        <li>`/api/auth/logout`</li>
        <li>`/api/auth/me`</li>
        <li>`/api/properties`</li>
        <li>`/api/inquiries`</li>
      </ul>
    </main>
  )
}
