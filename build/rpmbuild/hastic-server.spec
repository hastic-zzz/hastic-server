%define name hastic-server
%define version %{getenv:HASTIC_RELEASE_VERSION}_node%{getenv:RPM_NODE_VERSION}
%define release 0
%define buildroot /root/rpmbuild/BUILDROOT
%define builddir /root/rpmbuild/BUILD

Name: %{name}
Version: %{version}
Release: %{release}
Summary: hastic-server

Group: Installation Script
License: Apache-2.0
URL: hastic.io
BuildRoot: %{buildroot}
Requires: nodejs >= %{getenv:NODE_VERSION}
AutoReqProv: no
AutoReq: no
BuildArch: noarch

%description
REST server for managing data for analytics

%prep
rm -rf %{builddir}/*
mkdir -p %{builddir}
cp -r %{builddir}/../server %{builddir}/
cp -r %{builddir}/../analytics %{builddir}/
set +x
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install %{getenv:NODE_VERSION}
set -x

%build
pushd analytics
mkdir -p dist/server
touch dist/server/server

save=$RPM_BUILD_ROOT
unset RPM_BUILD_ROOT

pip3 install -U pip setuptools pyinstaller
pip3 install -r requirements.txt
pyinstaller -y --additional-hooks-dir=pyinstaller_hooks --paths=analytics/ bin/server
chmod +x dist/server/server

export RPM_BUILD_ROOT=$save
popd

pushd server
set +x
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use %{getenv:NODE_VERSION}
set -x
npm install
npm prune --production
npm rebuild
popd

%install
mkdir -p %{buildroot}/usr/lib/hastic-server/server
mkdir -p %{buildroot}/usr/lib/hastic-server/analytics/dist/server
cp -r server/dist %{buildroot}/usr/lib/hastic-server/server/
cp -r analytics/dist/server/server %{buildroot}/usr/lib/hastic-server/analytics/dist/server/

%post
mkdir -p /etc/hastic-server/
if [ ! -f /etc/hastic-server/config.json ]; then
  echo '{}' > /etc/hastic-server/config.json
fi
ln -s /etc/hastic-server/config.json /usr/lib/hastic-server/config.json

mkdir -p /var/hastic-server/
ln -s /usr/lib/hastic-server/data /var/hastic-server/data

echo 'node /usr/lib/hastic-server/server/dist/server' > /usr/bin/hastic-server
chmod +x /usr/bin/hastic-server


%clean
rm -rf %{buildroot}

%files
%defattr(644, root, root, 755)
/usr/lib/hastic-server

%preun
rm /usr/bin/hastic-server
