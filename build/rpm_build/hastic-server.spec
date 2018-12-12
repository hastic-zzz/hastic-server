%define name hastic-server
%define version 0.2.6_alpha
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
Requires: nodejs >= 6
BuildRequires: nodejs
AutoReqProv: no
BuildArch: noarch

%description
REST server for managing data for analytics

%prep
rm -rf %{builddir}
mkdir -p %{builddir}
cp -r ../server %{builddir}/
cp -r ../analytics %{builddir}/

mkdir -p %{builddir}/.git
cp -r ../.git/HEAD %{builddir}/.git/HEAD
cp -r ../.git/refs %{builddir}/.git/refs

%build
pushd analytics

save=$RPM_BUILD_ROOT
unset RPM_BUILD_ROOT

pip3 -q install -U pip setuptools pyinstaller
pip3 -q install -r requirements.txt
pyinstaller --additional-hooks-dir=pyinstaller_hooks --paths=analytics/ bin/server
chmod +x dist/server/server

export RPM_BUILD_ROOT=$save
popd

pushd server
npm prune --production
npm rebuild
popd

%install
mkdir -p %{buildroot}/usr/lib/hastic-server
cp -r ./ %{buildroot}/usr/lib/hastic-server

%post
mkdir -p /etc/hastic-server/
if [ ! -f /etc/hastic-server/config ]; then
  echo '{}' > /etc/hastic-server/config
fi
ln -s /etc/hastic-server/config.json /usr/lib/hastic-server/config.json

mkdir -p /var/hastic-server/
ln -s /usr/lib/hastic-server/data /var/hastic-server/data

echo 'node /usr/lib/hastic-server/server/dist/server' > /usr/bin/hastic-server


%clean
rm -rf %{buildroot}

%files
%defattr(644, root, root, 755)
/usr/lib/hastic-server
