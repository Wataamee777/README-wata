# 外部ファイルに保存

def flags_to_names(flags_raw; pf):
  [ (flags_raw | fromjson) as $f
    | $f | to_entries[]
    | select((pf & (.key|tonumber)) != 0)
    | .value ];

def status_name(s):
  if s=="online" then "🟢 オンライン"
  elif s=="idle" then "🌙 退席中"
  elif s=="dnd" then "⛔ 取り込み中"
  else "🔘 オフライン" end;

def to_hex(n):
  if n==null then null else "#" + (n | tonumber | tostring | tonumber | toString(16)) end;

.[0] as $profile
| .[1] as $member
| .[2] as $guild
| ($profile.public_flags) as $pf
| $profile
+ {
    avatar: (if $profile.avatar then ($base + "/avatars/" + $profile.id + "/" + $profile.avatar + ".png") else null end),
    banner: (if $profile.banner then ($base + "/banners/" + $profile.id + "/" + $profile.banner + ".png") else null end),
    banner_color: $profile.banner_color,
    accent_color: ($profile.accent_color | to_hex),
    status: ($member.presence.status | status_name),
    clan: {
      id: $guild.id,
      name: $guild.name,
      icon: (if $guild.icon then ($base + "/icons/" + $guild.id + "/" + $guild.icon + ".png") else null end)
    },
    public_flags: flags_to_names($flags[0]; $pf)
  }
| del(.discriminator, .discussions, .collectibles)
