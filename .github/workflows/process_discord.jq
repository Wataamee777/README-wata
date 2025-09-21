def flags_to_names(flags_raw):
  [ (flags_raw[0] | fromjson) as $f
    | .[0].public_flags as $pf
    | $f | to_entries[]
    | select(($pf & (.key|tonumber)) != 0)
    | .value ];

def status_name(s):
  if s=="online" then "🟢 オンライン"
  elif s=="idle" then "🌙 退席中"
  elif s=="dnd" then "⛔ 取り込み中"
  else "🔘 オフライン" end;

def to_hex(n):
  if n==null then null else "#" + (n | tonumber | tostring | tonumber | toString(16)) end;

.[0]
+ {
    avatar: (if .[0].avatar then ($base + "/avatars/" + .[0].id + "/" + .[0].avatar + ".png") else null end),
    banner: (if .[0].banner then ($base + "/banners/" + .[0].id + "/" + .[0].banner + ".png") else null end),
    banner_color: .[0].banner_color,
    accent_color: (.accent_color | to_hex),
    status: (.[1].presence.status | status_name),
    clan: {
      id: .[2].id,
      name: .[2].name,
      icon: (if .[2].icon then ($base + "/icons/" + .[2].id + "/" + .[2].icon + ".png") else null end)
    },
    public_flags: flags_to_names($flags)
  }
| del(.discriminator, .discussions, .collectibles)
