/**
 * Grind i18n — Pidgin (default) and English strings.
 * Usage:
 *   import { t } from '@/lib/i18n';
 *   t('home.greeting_morning') // "Good morning, hustler"
 *
 * Language is stored in localStorage under 'grind_lang'.
 * Default is 'pidgin'.
 */

export type Lang = 'pidgin' | 'english';

export function getLang(): Lang {
  try {
    const stored = localStorage.getItem('grind_lang');
    if (stored === 'english') return 'english';
  } catch { /* ignore */ }
  return 'pidgin';
}

export function setLang(lang: Lang): void {
  try { localStorage.setItem('grind_lang', lang); } catch { /* ignore */ }
}

// ── String catalogue ──────────────────────────────────────────────────────────
const strings: Record<string, { pidgin: string; english: string }> = {

  // ── Greetings ──────────────────────────────────────────────────────────────
  'greeting.morning':        { pidgin: 'Good morning, hustler',         english: 'Good morning' },
  'greeting.afternoon':      { pidgin: 'Good afternoon, hustler',       english: 'Good afternoon' },
  'greeting.evening':        { pidgin: 'Good evening, hustler',         english: 'Good evening' },
  'greeting.back':           { pidgin: 'Welcome back',                  english: 'Welcome back' },

  // ── Auth ───────────────────────────────────────────────────────────────────
  'auth.tagline':            { pidgin: 'Way for poor people',           english: 'Way for poor people' },
  'auth.welcome_title':      { pidgin: 'Welcome to Grind',             english: 'Welcome to Grind' },
  'auth.welcome_sub':        { pidgin: 'Campus hustle platform for naija students', english: 'The campus gig economy for Nigerian students' },
  'auth.google':             { pidgin: 'Continue with Google',          english: 'Continue with Google' },
  'auth.phone':              { pidgin: 'Continue with Phone',           english: 'Continue with Phone' },
  'auth.email':              { pidgin: 'Continue with Email',           english: 'Continue with Email' },
  'auth.enter_phone':        { pidgin: 'Enter your number',             english: 'Enter your phone number' },
  'auth.otp_sent':           { pidgin: 'We don send 6-digit code',     english: 'We sent a 6-digit code to' },
  'auth.verify_number':      { pidgin: 'Verify your number',           english: 'Verify your number' },
  'auth.enter_email':        { pidgin: 'Enter your email',              english: 'Enter your email' },
  'auth.create_account':     { pidgin: 'Create your account',          english: 'Create your account' },
  'auth.one_step_away':      { pidgin: 'One step and you go start grinding', english: 'You are one step away from your first gig' },
  'auth.sending':            { pidgin: 'Sending...',                    english: 'Sending...' },
  'auth.verifying':          { pidgin: 'Verifying...',                 english: 'Verifying...' },
  'auth.send_code':          { pidgin: 'Send Code',                    english: 'Send Code' },
  'auth.resend_code':        { pidgin: 'Nor receive code? Resend am',  english: "Didn't receive a code? Resend" },
  'auth.wrong_code':         { pidgin: 'Code nor correct. Try again',  english: 'Incorrect code. Please try again.' },
  'auth.creating':           { pidgin: 'Creating account...',          english: 'Creating account...' },
  'auth.logging_in':         { pidgin: 'Entering...',                  english: 'Logging in...' },
  'auth.success_google':     { pidgin: 'You don enter. Welcome!',      english: 'Signed in with Google. Welcome!' },
  'auth.success_register':   { pidgin: 'Account don create. Welcome to Grind!', english: 'Account created. Welcome to Grind!' },

  // ── Onboarding ─────────────────────────────────────────────────────────────
  'onboard.pick_role':       { pidgin: 'How you wan use Grind?',       english: 'How do you want to use Grind?' },
  'onboard.earn':            { pidgin: 'I wan earn money',             english: 'I want to earn money' },
  'onboard.hire':            { pidgin: 'I wan hire person',            english: 'I want to hire someone' },
  'onboard.sell':            { pidgin: 'I wan sell something',         english: 'I want to sell something' },
  'onboard.company':         { pidgin: 'I be company or brand',        english: 'I represent a company or brand' },
  'onboard.setup_profile':   { pidgin: 'Set up your profile',         english: 'Set up your profile' },
  'onboard.choose_handle':   { pidgin: 'Pick your handle',            english: 'Choose your handle' },
  'onboard.handle_taken':    { pidgin: 'That handle don go. Try another one', english: 'That handle is taken. Try another.' },
  'onboard.handle_free':     { pidgin: 'E dey available!',            english: 'Available!' },
  'onboard.skills_pick':     { pidgin: 'Wetin you sabi do?',          english: 'What are your skills?' },
  'onboard.verify_student':  { pidgin: 'Verify say you be student',   english: 'Verify your student status' },
  'onboard.verify_sub':      { pidgin: 'Use your school email or upload your student ID', english: 'Use your school email or upload your student ID' },
  'onboard.pending_verify':  { pidgin: 'Your verification dey pending. You fit browse but nor fit do transaction yet', english: 'Verification pending. You can browse but cannot transact yet.' },
  'onboard.wallet_setup':    { pidgin: 'Set up your wallet',          english: 'Set up your wallet' },
  'onboard.wallet_sub':      { pidgin: 'Your money dey safe here. Escrow go hold am until job don finish', english: 'Your money is safe here. Escrow holds it until the job is done.' },
  'onboard.bank_details':    { pidgin: 'Add your bank details',       english: 'Add your bank details' },
  'onboard.bank_sub':        { pidgin: 'We go send your money here when you withdraw', english: 'This is where we send your money when you withdraw.' },
  'onboard.checklist_profile': { pidgin: 'Profile don ready',        english: 'Profile complete' },
  'onboard.checklist_verify': { pidgin: 'Student verified',           english: 'Student verified' },
  'onboard.checklist_gig':   { pidgin: 'First gig done',              english: 'First gig completed' },
  'onboard.checklist_payout': { pidgin: 'First payout received',     english: 'First payout received' },

  // ── Home ───────────────────────────────────────────────────────────────────
  'home.balance':            { pidgin: 'Your balance',                 english: 'Available Balance' },
  'home.quick_actions':      { pidgin: 'Shortcuts',                   english: 'Quick Actions' },
  'home.smart_pick':         { pidgin: 'We see something for you',    english: 'Recommended for You' },
  'home.streak':             { pidgin: 'Your hustle streak',          english: 'Your streak' },
  'home.streak_keep':        { pidgin: 'Keep am going. Nor break am!', english: 'Keep it going. Don\'t break it!' },
  'home.streak_broken':      { pidgin: 'Streak don break. Start again from today', english: 'Streak broken. Start fresh today.' },
  'home.sapa_meter':         { pidgin: 'Sapa Meter',                  english: 'Weekly Earnings' },
  'home.sapa_target':        { pidgin: 'Set your weekly target',      english: 'Set your weekly target' },
  'home.seller_week':        { pidgin: 'Seller of the Week',          english: 'Seller of the Week' },
  'home.no_gigs':            { pidgin: 'No gig dey here yet. Go post one.', english: 'No gigs yet. Post one to get started.' },
  'home.post_gig':           { pidgin: 'Post a Gig',                  english: 'Post a Gig' },
  'home.browse_gigs':        { pidgin: 'See all gigs',                english: 'Browse Gigs' },

  // ── Gigs ───────────────────────────────────────────────────────────────────
  'gig.apply':               { pidgin: 'Apply for this gig',          english: 'Apply for Gig' },
  'gig.applied':             { pidgin: 'You don apply!',              english: 'Applied!' },
  'gig.applying':            { pidgin: 'Submitting...',               english: 'Submitting...' },
  'gig.pitch_placeholder':   { pidgin: 'Tell them why you be the right person for this gig...', english: 'Tell the poster why you are the best fit...' },
  'gig.urgent':              { pidgin: 'Urgent Now',                  english: 'Urgent Now' },
  'gig.escrow':              { pidgin: 'Secured by escrow',           english: 'Secured by escrow' },
  'gig.no_gigs_category':    { pidgin: 'No gig dey for this category. Check another one', english: 'No gigs in this category. Try another.' },
  'gig.no_results':          { pidgin: 'No gig match your search. Try different word', english: 'No gigs matched your search.' },
  'gig.post_success':        { pidgin: 'Your gig don dey live! Students go see am now now', english: 'Your gig is live! Students will see it shortly.' },
  'gig.apply_success':       { pidgin: 'Application sent! Wait for reply', english: 'Application sent! The poster will respond shortly.' },
  'gig.mark_done':           { pidgin: 'Mark as done',                english: 'Mark as Done' },
  'gig.approve':             { pidgin: 'Approve and release money',   english: 'Approve and Release Funds' },
  'gig.dispute':             { pidgin: 'Open a dispute',              english: 'Open a Dispute' },
  'gig.cancel':              { pidgin: 'Cancel gig',                  english: 'Cancel Gig' },
  'gig.accept':              { pidgin: 'Accept this person',          english: 'Accept Applicant' },
  'gig.doer_earns':          { pidgin: 'You go earn',                 english: 'You earn' },
  'gig.load_more':           { pidgin: 'Load more gigs',              english: 'Load More' },
  'gig.loading':             { pidgin: 'Loading gigs...',             english: 'Loading gigs...' },

  // ── Categories ─────────────────────────────────────────────────────────────
  'cat.writing':             { pidgin: 'Writing',                     english: 'Writing' },
  'cat.design':              { pidgin: 'Design',                      english: 'Design' },
  'cat.coding':              { pidgin: 'Coding',                      english: 'Coding' },
  'cat.tutoring':            { pidgin: 'Tutoring',                    english: 'Tutoring' },
  'cat.delivery':            { pidgin: 'Delivery',                    english: 'Delivery' },
  'cat.research':            { pidgin: 'Research',                    english: 'Research' },
  'cat.video':               { pidgin: 'Video',                       english: 'Video' },
  'cat.hostel_runs':         { pidgin: 'Hostel Runs',                 english: 'Hostel Runs' },
  'cat.food_pickup':         { pidgin: 'Food Pickup',                 english: 'Food Pickup' },
  'cat.assignment':          { pidgin: 'Assignment',                  english: 'Assignment Typing' },
  'cat.braid_barb':          { pidgin: 'Braid and Barb',              english: 'Hair and Beauty' },
  'cat.thrift':              { pidgin: 'Thrift',                      english: 'Thrift' },
  'cat.phone_repair':        { pidgin: 'Phone Repair',                english: 'Phone Repair' },
  'cat.printing':            { pidgin: 'Printing',                    english: 'Printing' },
  'cat.laundry':             { pidgin: 'Laundry',                     english: 'Laundry' },
  'cat.other':               { pidgin: 'Other',                       english: 'Other' },

  // ── Tiers ──────────────────────────────────────────────────────────────────
  'tier.fresher':            { pidgin: 'Fresher',                     english: 'Fresher' },
  'tier.padi':               { pidgin: 'Padi',                        english: 'Padi' },
  'tier.plug':               { pidgin: 'Plug',                        english: 'Plug' },
  'tier.oga':                { pidgin: 'Oga',                         english: 'Oga' },
  'tier.big':                { pidgin: 'Big Oga',                     english: 'Big Player' },
  'tier.level_up':           { pidgin: 'You don level up!',           english: 'You levelled up!' },
  'tier.level_up_sub':       { pidgin: 'Congratulations, you don become',  english: 'Congratulations, you are now' },

  // ── Wallet ─────────────────────────────────────────────────────────────────
  'wallet.add_money':        { pidgin: 'Add Money',                   english: 'Add Money' },
  'wallet.send':             { pidgin: 'Send',                        english: 'Send' },
  'wallet.withdraw':         { pidgin: 'Cash Out',                    english: 'Withdraw' },
  'wallet.balance':          { pidgin: 'Your balance',                english: 'Balance' },
  'wallet.history':          { pidgin: 'Transactions',                english: 'Transaction History' },
  'wallet.download':         { pidgin: 'Download statement',          english: 'Download Statement' },
  'wallet.fund_success':     { pidgin: 'Gbam! Money don enter.',      english: 'Money added successfully.' },
  'wallet.withdraw_success': { pidgin: 'Your money dey come. E go land soon soon', english: 'Withdrawal initiated. It will arrive shortly.' },
  'wallet.send_success':     { pidgin: 'Money don land for their side!', english: 'Transfer successful!' },
  'wallet.insufficient':     { pidgin: 'Money nor reach. Top up first', english: 'Insufficient balance. Please top up.' },
  'wallet.min_withdraw':     { pidgin: 'Minimum withdrawal na ₦500', english: 'Minimum withdrawal is ₦500.' },
  'wallet.min_fund':         { pidgin: 'Minimum na ₦100',             english: 'Minimum amount is ₦100.' },
  'wallet.processing':       { pidgin: 'Processing...',               english: 'Processing...' },
  'wallet.withdraw_pending': { pidgin: 'Withdrawal dey process. Check back in 1-2 hours', english: 'Withdrawal processing. Check back in 1-2 hours.' },
  'wallet.withdraw_paid':    { pidgin: 'Alert! Your money don land.', english: 'Alert! Your withdrawal has been paid.' },
  'wallet.withdraw_failed':  { pidgin: 'Withdrawal fail. We go try again', english: 'Withdrawal failed. We will retry automatically.' },
  'wallet.no_transactions':  { pidgin: 'No transaction yet. Add money to start', english: 'No transactions yet. Add money to get started.' },
  'wallet.virtual_account':  { pidgin: 'Transfer to this account',   english: 'Transfer to this account' },

  // ── Notifications ──────────────────────────────────────────────────────────
  'notif.money_in':          { pidgin: 'Alert! ₦{amount} don land.',  english: 'Alert! ₦{amount} received.' },
  'notif.new_gig':           { pidgin: 'New gig match your skill',    english: 'New gig matches your skills' },
  'notif.application':       { pidgin: 'Someone apply for your gig', english: 'New application on your gig' },
  'notif.gig_accepted':      { pidgin: 'Your application don accept!', english: 'Your application was accepted!' },
  'notif.gig_approved':      { pidgin: 'Gig don approve. Money dey come', english: 'Gig approved. Payment releasing.' },
  'notif.mark_all_read':     { pidgin: 'Mark all as read',            english: 'Mark all read' },
  'notif.empty':             { pidgin: 'No notification yet',         english: 'No notifications yet.' },

  // ── Chat ───────────────────────────────────────────────────────────────────
  'chat.placeholder':        { pidgin: 'Type something...',           english: 'Type a message...' },
  'chat.you':                { pidgin: 'You',                         english: 'You' },
  'chat.online':             { pidgin: 'Online',                      english: 'Online' },
  'chat.typing':             { pidgin: 'dey type...',                 english: 'typing...' },
  'chat.no_messages':        { pidgin: 'No message yet. Say hi!',     english: 'No messages yet. Say hello!' },
  'chat.report':             { pidgin: 'Report this person',          english: 'Report User' },
  'chat.block':              { pidgin: 'Block this person',           english: 'Block User' },

  // ── Live ───────────────────────────────────────────────────────────────────
  'live.browse':             { pidgin: 'Live streams',                english: 'Live Streams' },
  'live.go_live':            { pidgin: 'Go Live',                     english: 'Go Live' },
  'live.no_streams':         { pidgin: 'Nobody dey live right now. You fit be first!', english: 'No live streams right now. Start one!' },
  'live.viewers':            { pidgin: 'viewers',                     english: 'viewers' },
  'live.gift_rose':          { pidgin: 'Rose',                        english: 'Rose' },
  'live.gift_naira':         { pidgin: 'Naira Rain',                  english: 'Naira Rain' },
  'live.gift_fire':          { pidgin: 'Fire',                        english: 'Fire' },
  'live.gift_crown':         { pidgin: 'Crown',                       english: 'Crown' },
  'live.stream_title':       { pidgin: 'Wetin you wan stream today?', english: 'What will you stream today?' },
  'live.end_stream':         { pidgin: 'End stream',                  english: 'End Stream' },
  'live.ended':              { pidgin: 'Stream don end. E be like say you killed am!', english: 'Stream ended. Great session!' },
  'live.schedule':           { pidgin: 'Schedule a stream',           english: 'Schedule a Stream' },
  'live.reminder_set':       { pidgin: 'Reminder don set!',           english: 'Reminder set!' },

  // ── Profile ────────────────────────────────────────────────────────────────
  'profile.edit':            { pidgin: 'Edit profile',                english: 'Edit Profile' },
  'profile.share':           { pidgin: 'Share your profile',          english: 'Share Profile' },
  'profile.tasks_done':      { pidgin: 'Tasks done',                  english: 'Tasks Done' },
  'profile.on_time':         { pidgin: 'On time',                     english: 'On-Time Rate' },
  'profile.rating':          { pidgin: 'Rating',                      english: 'Rating' },
  'profile.earnings':        { pidgin: 'Total earned',                english: 'Total Earned' },
  'profile.no_gigs':         { pidgin: 'No gig history yet. Your first gig go show here', english: 'No gig history yet.' },
  'profile.verified':        { pidgin: 'Verified Student',            english: 'Verified Student' },
  'profile.pending':         { pidgin: 'Verification pending',        english: 'Verification Pending' },
  'profile.views_today':     { pidgin: '{n} person view your gig today', english: '{n} people viewed your gig today' },

  // ── Settings ───────────────────────────────────────────────────────────────
  'settings.title':          { pidgin: 'Settings',                    english: 'Settings' },
  'settings.language':       { pidgin: 'Language (Pidgin/English)',   english: 'Language' },
  'settings.notifications':  { pidgin: 'Notifications',               english: 'Notifications' },
  'settings.security':       { pidgin: 'Security',                    english: 'Security' },
  'settings.bank':           { pidgin: 'Bank details',                english: 'Bank Details' },
  'settings.help':           { pidgin: 'Help',                        english: 'Help & Support' },
  'settings.terms':          { pidgin: 'Terms and Privacy',           english: 'Terms & Privacy' },
  'settings.logout':         { pidgin: 'Log out',                     english: 'Log Out' },
  'settings.delete_account': { pidgin: 'Delete account',             english: 'Delete Account' },
  'settings.saved':          { pidgin: 'Settings don save!',          english: 'Settings saved!' },
  'settings.dark_mode':      { pidgin: 'Dark mode',                   english: 'Dark Mode' },

  // ── Requests Board ─────────────────────────────────────────────────────────
  'requests.title':          { pidgin: 'Requests Board',              english: 'Requests Board' },
  'requests.post':           { pidgin: 'Post a request',              english: 'Post a Request' },
  'requests.placeholder':    { pidgin: 'Wetin you need help with?',   english: 'What do you need help with?' },
  'requests.no_requests':    { pidgin: 'No request yet. Post one now!', english: 'No requests yet. Post one!' },
  'requests.make_offer':     { pidgin: 'Make an offer',               english: 'Make an Offer' },
  'requests.offer_sent':     { pidgin: 'Your offer don go!',          english: 'Offer sent!' },
  'requests.pick_offer':     { pidgin: 'Pick this offer',             english: 'Accept This Offer' },
  'requests.convert_gig':    { pidgin: 'Convert to gig',              english: 'Convert to Gig' },

  // ── Leaderboard ────────────────────────────────────────────────────────────
  'leaderboard.title':       { pidgin: 'Top Hustlers',                english: 'Leaderboard' },
  'leaderboard.campus':      { pidgin: 'Top Hustlers for {campus}',   english: 'Top Hustlers at {campus}' },
  'leaderboard.hostel':      { pidgin: 'Hostel vs Hostel',            english: 'Hostel Challenge' },
  'leaderboard.prize':       { pidgin: 'Top 3 go win cash prize from platform fees', english: 'Top 3 win cash prizes from platform fees.' },
  'leaderboard.week_reset':  { pidgin: 'Board reset every Monday 12am', english: 'Resets every Monday at midnight.' },
  'leaderboard.your_rank':   { pidgin: 'Your rank',                   english: 'Your Rank' },

  // ── Spin ───────────────────────────────────────────────────────────────────
  'spin.title':              { pidgin: 'Daily Spin',                  english: 'Daily Spin' },
  'spin.sub':                { pidgin: 'Spin once every day. You fit win something small', english: 'One spin per day. You could win something!' },
  'spin.spin':               { pidgin: 'Spin!',                       english: 'Spin!' },
  'spin.already_spun':       { pidgin: 'You don spin today already. Come back tomorrow', english: 'Already spun today. Come back tomorrow.' },
  'spin.won_credit':         { pidgin: 'You win ₦{amount} credit!',   english: 'You won ₦{amount} credit!' },
  'spin.won_free_gig':       { pidgin: 'You win one free gig post!',  english: 'You won a free gig post!' },
  'spin.try_again':          { pidgin: 'Try again tomorrow',          english: 'Better luck tomorrow!' },

  // ── Errors ─────────────────────────────────────────────────────────────────
  'error.generic':           { pidgin: 'Wahala dey. Try again.',      english: 'Something went wrong. Please try again.' },
  'error.network':           { pidgin: 'Network wahala. Check your connection', english: 'Network error. Check your connection.' },
  'error.not_found':         { pidgin: 'Omo, we nor find this page. E don comot', english: 'Page not found.' },
  'error.not_found_sub':     { pidgin: 'The link nor dey work. Go back home and try again', english: 'This page does not exist. Go back home.' },
  'error.go_home':           { pidgin: 'Go back home',                english: 'Go Home' },
  'error.retry':             { pidgin: 'Try again',                   english: 'Try Again' },
  'error.offline':           { pidgin: 'No internet. We go try again when network come', english: 'You are offline. We will retry when you reconnect.' },
  'error.session_expired':   { pidgin: 'Your session don expire. Log in again', english: 'Session expired. Please log in again.' },

  // ── Success ────────────────────────────────────────────────────────────────
  'success.saved':           { pidgin: 'Saved!',                      english: 'Saved!' },
  'success.copied':          { pidgin: 'Link don copy!',              english: 'Link copied!' },
  'success.submitted':       { pidgin: 'Submitted!',                  english: 'Submitted!' },
  'success.deleted':         { pidgin: 'Deleted.',                    english: 'Deleted.' },
  'success.reported':        { pidgin: 'Report don go. We go look am', english: 'Report submitted. We will review it.' },

  // ── Loading / Empty ────────────────────────────────────────────────────────
  'loading.default':         { pidgin: 'Loading...',                  english: 'Loading...' },
  'empty.gigs':              { pidgin: 'No gig dey here yet. Go post one.', english: 'No gigs here yet. Post one.' },
  'empty.messages':          { pidgin: 'No message yet. Start the conversation', english: 'No messages yet.' },
  'empty.notifications':     { pidgin: 'Nothing dey here. You dey quiet today!', english: 'Nothing here. All caught up!' },
  'empty.posts':             { pidgin: 'Nothing dey feed. Be the first to post!', english: 'Nothing in the feed yet. Post something!' },
  'empty.applications':      { pidgin: 'Nobody apply yet. Share your gig!', english: 'No applications yet. Share your gig!' },
  'empty.transactions':      { pidgin: 'No transaction yet. Add money to start grinding', english: 'No transactions yet.' },
  'empty.streams':           { pidgin: 'Nobody dey live right now',   english: 'No live streams right now.' },

  // ── Reports ────────────────────────────────────────────────────────────────
  'report.title':            { pidgin: 'Report this',                 english: 'Report' },
  'report.sub':              { pidgin: 'Tell us wetin happen',        english: 'Tell us what happened.' },
  'report.spam':             { pidgin: 'Na spam or scam',             english: 'Spam or scam' },
  'report.inappropriate':    { pidgin: 'Content nor correct',         english: 'Inappropriate content' },
  'report.fake':             { pidgin: 'Na fake profile',             english: 'Fake profile' },
  'report.harassment':       { pidgin: 'Person dey harass me',        english: 'Harassment' },
  'report.other':            { pidgin: 'Something else',              english: 'Other' },
  'report.send':             { pidgin: 'Send report',                 english: 'Submit Report' },
  'report.success':          { pidgin: 'Report don go. We go look am', english: 'Report submitted. We will review it.' },

  // ── Share card ─────────────────────────────────────────────────────────────
  'share.title':             { pidgin: 'See how I dey grind!',        english: 'See how I hustle on Grind!' },
  'share.sub':               { pidgin: 'I just finish one gig on Grind',    english: 'I just completed a gig on Grind.' },
  'share.download':          { pidgin: 'Download card',               english: 'Download Card' },
  'share.whatsapp':          { pidgin: 'Share on WhatsApp',           english: 'Share on WhatsApp' },

  // ── Help ───────────────────────────────────────────────────────────────────
  'help.title':              { pidgin: 'Help Center',                 english: 'Help Center' },
  'help.contact':            { pidgin: 'Chat support',                english: 'Contact Support' },
  'help.faq':                { pidgin: 'Frequent questions',          english: 'FAQ' },
  'help.faq_1_q':            { pidgin: 'How does escrow work?',       english: 'How does escrow work?' },
  'help.faq_1_a':            { pidgin: 'When you post a gig, the money lock for escrow. The doer nor go see am until you approve the work.', english: 'When a gig is posted, the budget is locked in escrow. The doer only receives it when you approve the completed work.' },
  'help.faq_2_q':            { pidgin: 'How long withdrawal take?',   english: 'How long does withdrawal take?' },
  'help.faq_2_a':            { pidgin: 'Normal na 1 to 2 hours. If network wahala, e fit take up to 24 hours.', english: 'Usually 1 to 2 hours. In rare cases up to 24 hours.' },
  'help.faq_3_q':            { pidgin: 'How I go verify my account?', english: 'How do I verify my account?' },
  'help.faq_3_a':            { pidgin: 'Use your school email or upload your student ID for the verification screen.', english: 'Use your school email or upload your student ID on the verification screen.' },
};

/**
 * Translate a key to the active language.
 * Replacements: pass an object like { amount: '5000' } for keys containing {amount}.
 */
export function t(key: string, replacements?: Record<string, string | number>): string {
  const lang = getLang();
  const entry = strings[key];
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[i18n] Missing key: "${key}"`);
    }
    return key;
  }
  let str = entry[lang] ?? entry.pidgin;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return str;
}

/** React hook — returns t() bound to the current lang and re-renders on change */
import { useState, useEffect, useCallback } from 'react';

export function useTranslation() {
  const [lang, setLangState] = useState<Lang>(getLang);

  useEffect(() => {
    const handler = () => setLangState(getLang());
    window.addEventListener('grind_lang_change', handler);
    return () => window.removeEventListener('grind_lang_change', handler);
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    setLangState(l);
    window.dispatchEvent(new Event('grind_lang_change'));
  }, []);

  const translate = useCallback(
    (key: string, replacements?: Record<string, string | number>) => t(key, replacements),
    [lang] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { t: translate, lang, changeLang };
}
