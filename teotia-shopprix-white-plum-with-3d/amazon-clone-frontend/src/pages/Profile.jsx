import { useEffect, useMemo, useState } from 'react'
import { UserCircle, Mail, ShieldCheck, CalendarDays, MapPin, Package, Heart, Pencil, Save, X, Plus, Trash2, Star, Phone, CheckCircle2, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const EMPTY_ADDRESS = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false }

export default function Profile() {
  const { user, updateProfile: saveAccount } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [savingAddress, setSavingAddress] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  async function loadProfile() {
    setLoading(true)
    try {
      const data = await api.get('/auth/profile', true)
      setProfile(data)
      setForm({ name: data?.name || '', email: data?.email || '' })
    } catch (err) {
      setError(err.message || 'Profile load nahi hua')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setMessage(''); setError('')
    try {
      const updated = await saveAccount(form)
      setProfile((current) => ({ ...current, ...updated }))
      setEditing(false)
      setMessage('Your account details have been updated successfully.')
    } catch (err) {
      setError(err.message || 'Profile update nahi hua')
    } finally { setSaving(false) }
  }

  function cancelEdit() {
    setForm({ name: profile?.name || '', email: profile?.email || '' })
    setEditing(false)
  }

  function startAddAddress() {
    setEditingAddressId('new')
    setAddressForm({ ...EMPTY_ADDRESS, fullName: profile?.name || '', phone: profile?.phone || '' })
    setMessage(''); setError('')
  }

  function startEditAddress(address) {
    setEditingAddressId(address._id)
    setAddressForm({ ...EMPTY_ADDRESS, ...address })
    setMessage(''); setError('')
  }

  function cancelAddress() {
    setEditingAddressId(null)
    setAddressForm(EMPTY_ADDRESS)
  }

  async function saveAddress(e) {
    e.preventDefault()
    setSavingAddress(true); setError(''); setMessage('')
    try {
      let addresses
      if (editingAddressId === 'new') {
        addresses = await api.put('/auth/profile/address', addressForm, true)
      } else {
        addresses = await api.put(`/auth/profile/address/${editingAddressId}`, addressForm, true)
      }
      setProfile((current) => ({ ...current, addresses }))
      setEditingAddressId(null)
      setAddressForm(EMPTY_ADDRESS)
      setMessage(editingAddressId === 'new' ? 'Address added successfully.' : 'Address updated successfully.')
    } catch (err) {
      setError(err.message || 'Address save nahi hua')
    } finally { setSavingAddress(false) }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true); setError(''); setMessage('')
    try {
      const result = await api.upload('/upload/profile-avatar', file)
      const updated = await saveAccount({ name: profile?.name || user?.name || '', email: profile?.email || user?.email || '', avatar: result.url })
      setProfile((current) => ({ ...current, ...updated }))
      setMessage('Profile photo updated successfully.')
    } catch (err) {
      setError(err.message || 'Profile photo upload nahi hua')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  async function removeAddress(id) {
    if (!window.confirm('Delete this saved address?')) return
    try {
      const addresses = await api.delete(`/auth/profile/address/${id}`, true)
      setProfile((current) => ({ ...current, addresses }))
      setMessage('Address removed.')
    } catch (err) { setError(err.message || 'Address delete nahi hua') }
  }

  async function makeDefault(id) {
    try {
      const addresses = await api.put(`/auth/profile/address/${id}/default`, {}, true)
      setProfile((current) => ({ ...current, addresses }))
      setMessage('Default address updated.')
    } catch (err) { setError(err.message || 'Default address update nahi hua') }
  }

  const addresses = profile?.addresses || []
  const created = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const completion = useMemo(() => {
    const checks = [profile?.name, profile?.email, profile?.phone, addresses.length > 0]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [profile, addresses.length])

  if (loading) return <main className="min-h-[70vh] bg-luxe-bg flex items-center justify-center text-slate-500">Loading your account...</main>
  if (error && !profile) return <main className="min-h-[70vh] bg-luxe-bg flex items-center justify-center text-red-500 px-4 text-center">{error}</main>

  return (
    <main className="bg-luxe-bg min-h-screen px-4 py-7 sm:py-9 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-[#E9E4EF] shadow-sm overflow-hidden mb-5">
          <div className="h-2 bg-gradient-to-r from-[#481F72] via-[#D4AF37] to-[#481F72]" />
          <div className="p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center gap-5">
            <div className="relative w-20 h-20 shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#F7F1FB] border border-[#E9E4EF] overflow-hidden flex items-center justify-center">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={62} strokeWidth={1.25} className="text-[#481F72]" />
                )}
              </div>
              <label className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-[#481F72] text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-sm" title="Change profile photo">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-black">My Account</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Hello, {profile?.name || user?.name || 'Customer'} 👋</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your personal details, delivery addresses and shopping preferences.</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#481F72]" /> Secure account</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-[#481F72]" /> Member since {created}</span>
              </div>
            </div>
            <div className="w-full lg:w-48 rounded-2xl bg-[#F7F1FB] p-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600"><span>Profile complete</span><span>{completion}%</span></div>
              <div className="h-2 rounded-full bg-white mt-2 overflow-hidden"><div className="h-full bg-[#481F72] rounded-full" style={{ width: `${completion}%` }} /></div>
              <Link to="/" className="inline-flex items-center justify-center w-full mt-3 rounded-xl bg-[#481F72] text-white px-3 py-2 text-sm font-bold hover:bg-[#351652]">Continue Shopping</Link>
            </div>
          </div>
        </div>

        {message && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 size={17} />{message}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-5">
          <section className="bg-white rounded-2xl border border-[#E9E4EF] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div><h2 className="font-black text-lg text-slate-900">Personal Details</h2><p className="text-xs text-slate-500 mt-1">You can change your name and email anytime.</p></div>
              {!editing && <button onClick={() => { setError(''); setMessage(''); setEditing(true) }} className="inline-flex items-center gap-2 rounded-xl bg-[#481F72] text-white px-3.5 py-2 text-sm font-bold"><Pencil size={15} /> Edit</button>}
            </div>
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <label className="block"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-xl border border-[#DCD3E5] px-4 py-3 text-sm outline-none focus:border-[#481F72]" /></label>
                <label className="block"><span className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="w-full rounded-xl border border-[#DCD3E5] px-4 py-3 text-sm outline-none focus:border-[#481F72]" /></label>
                <div className="rounded-xl bg-[#F7F1FB] border border-[#E9E4EF] p-3 text-sm"><div className="flex items-center gap-2 font-semibold text-slate-700"><Phone size={16} className="text-[#481F72]" /> {profile?.phone || 'No phone number'}</div><p className="text-xs text-slate-500 mt-1">Verified phone numbers are managed through OTP for account security.</p></div>
                <div className="flex justify-end gap-2"><button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-600"><X size={15} /> Cancel</button><button disabled={saving} type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-[#481F72] text-white px-5 py-2.5 text-sm font-bold disabled:opacity-60"><Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}</button></div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <Info icon={<UserCircle size={18} />} label="Full Name" value={profile?.name || '—'} />
                <Info icon={<Mail size={18} />} label="Email" value={profile?.email || 'Not added yet'} />
                <Info icon={<Phone size={18} />} label="Verified Phone" value={profile?.phone || '—'} />
                <Info icon={<ShieldCheck size={18} />} label="Account Type" value={profile?.role || 'customer'} />
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-[#E9E4EF] p-5 shadow-sm">
            <h2 className="font-black text-lg text-slate-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/orders" className="rounded-2xl border border-[#E9E4EF] p-4 hover:border-[#481F72] hover:bg-[#F7F1FB]"><Package size={22} className="text-[#481F72] mb-2" /><span className="text-sm font-bold">Your Orders</span><span className="block text-xs text-slate-500 mt-1">Track purchases</span></Link>
              <Link to="/wishlist" className="rounded-2xl border border-[#E9E4EF] p-4 hover:border-[#481F72] hover:bg-[#F7F1FB]"><Heart size={22} className="text-[#481F72] mb-2" /><span className="text-sm font-bold">Wishlist</span><span className="block text-xs text-slate-500 mt-1">Saved products</span></Link>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-[#E9E4EF] p-5 shadow-sm mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div><h2 className="font-black text-lg text-slate-900">Saved Addresses</h2><p className="text-xs text-slate-500 mt-1">Add, edit, delete or choose your default delivery address.</p></div>
            {editingAddressId === null && <button onClick={startAddAddress} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#481F72] text-white px-4 py-2.5 text-sm font-bold"><Plus size={16} /> Add Address</button>}
          </div>

          {editingAddressId !== null && <AddressForm form={addressForm} setForm={setAddressForm} saving={savingAddress} onSubmit={saveAddress} onCancel={cancelAddress} isNew={editingAddressId === 'new'} />}

          {addresses.length === 0 && editingAddressId === null ? <div className="rounded-2xl border border-dashed border-[#DCD3E5] p-7 text-center"><MapPin size={28} className="mx-auto text-[#481F72]" /><p className="font-bold text-slate-800 mt-2">No saved address yet</p><p className="text-sm text-slate-500 mt-1">Add your first address so checkout becomes faster.</p></div> : (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {addresses.map((a) => <AddressCard key={a._id} address={a} onEdit={() => startEditAddress(a)} onDelete={() => removeAddress(a._id)} onDefault={() => makeDefault(a._id)} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Info({ icon, label, value }) { return <div className="rounded-xl bg-[#F7F1FB] p-4"><div className="flex items-center gap-2 text-[#481F72]">{icon}<span className="text-xs uppercase tracking-wide font-bold">{label}</span></div><p className="text-sm font-semibold text-slate-800 mt-2 break-words">{value}</p></div> }

function AddressForm({ form, setForm, saving, onSubmit, onCancel, isNew }) {
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  return <form onSubmit={onSubmit} className="rounded-2xl bg-[#F7F1FB] border border-[#E9E4EF] p-4 mb-4">
    <div className="flex items-center justify-between mb-4"><div><h3 className="font-black text-slate-900">{isNew ? 'Add New Address' : 'Edit Address'}</h3><p className="text-xs text-slate-500 mt-1">Fill in your delivery details.</p></div><button type="button" onClick={onCancel} aria-label="Cancel"><X size={19} /></button></div>
    <div className="grid sm:grid-cols-2 gap-3">
      {[["fullName","Full Name"],["phone","Phone"],["line1","Address line 1"],["line2","Address line 2 (optional)"],["city","City"],["state","State"],["pincode","Pincode"]].map(([key,label]) => <label key={key} className="block"><span className="block text-xs font-bold text-slate-600 mb-1">{label}</span><input required={!['line2'].includes(key)} value={form[key] || ''} onChange={(e) => set(key, e.target.value)} className="w-full rounded-xl border border-[#DCD3E5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#481F72]" /></label>)}
    </div>
    <label className="flex items-center gap-2 mt-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={!!form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} /> Make this my default address</label>
    <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onCancel} className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-xl bg-[#481F72] text-white px-5 py-2.5 text-sm font-bold disabled:opacity-60">{saving ? 'Saving...' : 'Save Address'}</button></div>
  </form>
}

function AddressCard({ address, onEdit, onDelete, onDefault }) {
  return <article className={`rounded-2xl border p-4 ${address.isDefault ? 'border-[#481F72] bg-[#F7F1FB]' : 'border-[#E9E4EF] bg-white'}`}>
    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2 font-bold text-slate-800"><MapPin size={18} className="text-[#481F72]" /> {address.fullName || 'Delivery Address'}</div>{address.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-[#481F72] text-white px-2.5 py-1 text-[10px] font-black"><Star size={11} /> DEFAULT</span>}</div>
    <p className="text-sm text-slate-600 mt-3">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p><p className="text-sm text-slate-600">{address.city}, {address.state} - {address.pincode}</p>{address.phone && <p className="text-xs text-slate-500 mt-2">{address.phone}</p>}
    <div className="flex flex-wrap gap-2 mt-4"><button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold text-[#481F72]"><Pencil size={13} /> Edit</button><button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold text-red-600"><Trash2 size={13} /> Delete</button>{!address.isDefault && <button onClick={onDefault} className="inline-flex items-center gap-1.5 rounded-lg bg-[#481F72] text-white px-3 py-2 text-xs font-bold">Make Default</button>}</div>
  </article>
}
